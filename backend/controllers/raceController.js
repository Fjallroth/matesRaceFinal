import createError from "http-errors";
import mongoose from "mongoose";
import Race from "../models/Race.js";
import User from "../models/User.js";
import Participant from "../models/Participant.js";
import {
  getUserActivities as fetchUserActivitiesFromStrava,
  processAndSaveActivityResults as processActivityForRace,
} from "../services/stravaService.js";

const MAX_ACTIVE_ORGANIZED_RACES = 10;
const MAX_JOINED_RACES = 1000;
const MAX_RACE_PARTICIPANTS = 500;

const convertToRaceResponseDTO = async (
  race,
  includeParticipantsDetails = false,
  currentUserPassport = null
) => {
  if (!race) return null;

  let populatedRace = race;
  if (race.populated && !race.populated("organiser")) {
    populatedRace = await race.populate("organiser");
  } else if (!race.organiser.kind) {
    populatedRace = await Race.findById(race._id).populate("organiser").exec();
  }

  let participantCount = 0;
  let participantDTOs = [];

  if (includeParticipantsDetails) {
    const participants = await Participant.find({ race: race._id })
      .populate({
        path: "user",
        model: "User",
      })
      .exec();
    participantCount = participants.length;
    participantDTOs = participants.map((p) =>
      convertToParticipantSummaryDTO(p, race, currentUserPassport)
    );
  } else {
    participantCount = await Participant.countDocuments({ race: race._id });
  }

  let racePassword = null;
  if (
    currentUserPassport &&
    populatedRace.organiser &&
    populatedRace.organiser._id &&
    populatedRace.organiser._id.toString() === currentUserPassport.id.toString()
  ) {
    racePassword = race.password;
  }

  return {
    id: populatedRace._id.toString(),
    raceName: populatedRace.raceName,
    raceInfo: populatedRace.raceInfo,
    startDate: populatedRace.startDate.toISOString(),
    endDate: populatedRace.endDate.toISOString(),
    segmentIds: populatedRace.segmentIds,
    organiser: convertToUserSummaryDTO(populatedRace.organiser),
    isPrivate: populatedRace.isPrivate,
    hideLeaderboardUntilFinish: populatedRace.hideLeaderboardUntilFinish,
    useSexCategories: populatedRace.useSexCategories,
    participants: includeParticipantsDetails ? participantDTOs : [],
    participantCount: participantCount,
    password: racePassword,
  };
};

const convertToUserSummaryDTO = (user) => {
  if (!user || !user.stravaId) return null;
  return {
    stravaId: user.stravaId,
    displayName: user.displayName,
    userStravaFirstName: user.userStravaFirstName,
    userStravaLastName: user.userStravaLastName,
    userStravaPic: user.userStravaPic,
    userSex: user.userSex,
  };
};

const convertToParticipantSummaryDTO = (
  participant,
  raceContext,
  currentUserPassport
) => {
  if (!participant || !participant.user) return null;

  const currentUserId = currentUserPassport
    ? currentUserPassport.stravaId
    : null;

  const organiserId =
    raceContext.organiser && raceContext.organiser._id
      ? raceContext.organiser._id.toString()
      : null;

  const currentActualUserId = currentUserPassport
    ? currentUserPassport.id.toString()
    : null;

  const isOrganiser =
    organiserId && currentActualUserId && organiserId === currentActualUserId;

  const raceFinished =
    raceContext.endDate && new Date(raceContext.endDate) < new Date();

  const participantStravaId =
    participant.user && participant.user.stravaId
      ? participant.user.stravaId
      : null;

  const isCurrentParticipant =
    participantStravaId &&
    currentUserId &&
    participantStravaId === currentUserId;

  const showTimesForThisParticipant =
    isOrganiser ||
    raceFinished ||
    !raceContext.hideLeaderboardUntilFinish ||
    isCurrentParticipant;

  const segmentResultDTOs = (participant.segmentResults || []).map((psr) => ({
    segmentId: psr.segmentId,
    segmentName: psr.segmentName,
    elapsedTimeSeconds: showTimesForThisParticipant
      ? psr.elapsedTimeSeconds
      : null,
  }));

  return {
    id: participant._id.toString(),
    user: convertToUserSummaryDTO(participant.user),
    submittedRide: participant.submittedRide,
    submittedActivityId: participant.submittedActivityId,
    segmentResults: segmentResultDTOs,
  };
};

export const createRace = async (req, res, next) => {
  try {
    const {
      raceName,
      description,
      startDate,
      endDate,
      segmentIds,
      password,
      hideLeaderboardUntilFinish,
      useSexCategories,
    } = req.body;
    const organiserUser = req.user;

    if (!organiserUser) {
      return next(createError(401, "User not authenticated"));
    }

    // Check active organized race limit
    const now = new Date();
    const activeOrganizedRacesCount = await Race.countDocuments({
      organiser: organiserUser._id,
      endDate: { $gte: now }, // Races that haven't ended yet
    });

    if (
      activeOrganizedRacesCount >= MAX_ACTIVE_ORGANIZED_RACES &&
      !organiserUser.isPremium
    ) {
      // Added isPremium check
      return next(
        createError(
          403,
          `You have reached the maximum limit of ${MAX_ACTIVE_ORGANIZED_RACES} active organized races. Consider upgrading to premium for more.`
        )
      );
    }

    const newRace = new Race({
      raceName,
      raceInfo: description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      segmentIds,
      organiser: organiserUser._id,
      isPrivate: true,
      password,
      hideLeaderboardUntilFinish,
      useSexCategories,
    });

    const savedRace = await newRace.save();

    const organiserParticipant = new Participant({
      race: savedRace._id,
      user: organiserUser._id,
      submittedRide: false,
    });
    await organiserParticipant.save();

    const raceForResponse = await Race.findById(savedRace._id).populate(
      "organiser"
    );
    const responseDTO = await convertToRaceResponseDTO(
      raceForResponse,
      true,
      req.user
    );
    res.status(201).json(responseDTO);
  } catch (err) {
    if (err.name === "ValidationError") {
      return next(createError(400, err.message, { details: err.errors }));
    }
    console.error("Error creating race:", err);
    next(createError(500, err.message || "Failed to create race."));
  }
};

export const getAllRaces = async (req, res, next) => {
  try {
    const currentUser = req.user;
    if (!currentUser) {
      return next(createError(401, "User not authenticated. Please log in."));
    }

    const participations = await Participant.find({ user: currentUser._id })
      .select("race")
      .lean();

    const participatingRaceIds = participations.map((p) => p.race);

    const races = await Race.find({
      $or: [
        { organiser: currentUser._id },
        { _id: { $in: participatingRaceIds } },
      ],
    })
      .populate("organiser")
      .sort({ createdAt: -1 });

    const raceDTOs = await Promise.all(
      races.map(async (race) => {
        let detailedRace = race;
        if (
          !race.populated("organiser") &&
          race.organiser &&
          mongoose.Types.ObjectId.isValid(race.organiser.toString())
        ) {
          detailedRace = await Race.findById(race._id)
            .populate("organiser")
            .exec();
        }
        return convertToRaceResponseDTO(detailedRace, false, req.user);
      })
    );
    res.status(200).json(raceDTOs);
  } catch (err) {
    console.error("Error getting all races:", err);
    next(createError(500, "Failed to retrieve races."));
  }
};

export const getRaceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createError(400, "Invalid Race ID format."));
    }
    const race = await Race.findById(id).populate("organiser");
    if (!race) {
      return next(createError(404, `Race not found with ID: ${id}`));
    }

    const isOrganiser =
      race.organiser &&
      race.organiser._id.toString() === req.user._id.toString();
    const isParticipant = await Participant.findOne({
      race: race._id,
      user: req.user._id,
    });

    if (!isOrganiser && !isParticipant) {
      return next(
        createError(403, "You are not authorized to view this race.")
      );
    }

    const responseDTO = await convertToRaceResponseDTO(race, true, req.user);
    res.status(200).json(responseDTO);
  } catch (err) {
    console.error(`Error getting race by ID ${req.params.id}:`, err);
    next(createError(500, "Failed to retrieve race details."));
  }
};

export const editRace = async (req, res, next) => {
  try {
    const { id: raceId } = req.params;
    const updates = req.body;
    const currentUser = req.user;

    if (!mongoose.Types.ObjectId.isValid(raceId)) {
      return next(createError(400, "Invalid Race ID format."));
    }

    const raceToUpdate = await Race.findById(raceId);
    if (!raceToUpdate) {
      return next(createError(404, `Race not found with ID: ${raceId}`));
    }

    if (raceToUpdate.organiser.toString() !== currentUser._id.toString()) {
      return next(
        createError(403, "You are not authorized to edit this race.")
      );
    }

    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        if (key === "startDate" || key === "endDate") {
          raceToUpdate[key] = new Date(updates[key]);
        } else if (key === "password" && updates[key] === "") {
        } else {
          raceToUpdate[key] = updates[key];
        }
      }
    });
    raceToUpdate.isPrivate = true;

    const updatedRace = await raceToUpdate.save();
    const raceForResponse = await Race.findById(updatedRace._id).populate(
      "organiser"
    );
    const responseDTO = await convertToRaceResponseDTO(
      raceForResponse,
      true,
      req.user
    );
    res.status(200).json(responseDTO);
  } catch (err) {
    if (err.name === "ValidationError") {
      return next(createError(400, err.message, { details: err.errors }));
    }
    console.error("Error editing race:", err);
    next(createError(500, err.message || "Failed to update race."));
  }
};

export const deleteRace = async (req, res, next) => {
  try {
    const { id: raceId } = req.params;
    const currentUser = req.user;

    if (!mongoose.Types.ObjectId.isValid(raceId)) {
      return next(createError(400, "Invalid Race ID format."));
    }

    const raceToDelete = await Race.findById(raceId);
    if (!raceToDelete) {
      return next(createError(404, `Race not found with ID: ${raceId}`));
    }

    if (raceToDelete.organiser.toString() !== currentUser._id.toString()) {
      return next(
        createError(403, "You are not authorized to delete this race.")
      );
    }

    await Participant.deleteMany({ race: raceId });
    await Race.findByIdAndDelete(raceId);
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting race:", err);
    next(createError(500, err.message || "Failed to delete race."));
  }
};

export const getParticipatingRaces = async (req, res, next) => {
  try {
    const currentUser = req.user;
    if (!currentUser) return next(createError(401, "User not authenticated."));

    const participations = await Participant.find({ user: currentUser._id })
      .select("race")
      .populate({
        path: "race",
        populate: { path: "organiser" },
      });

    const races = participations.map((p) => p.race).filter(Boolean);

    const raceDTOs = await Promise.all(
      races.map((race) => convertToRaceResponseDTO(race, false, req.user))
    );
    res.status(200).json(raceDTOs);
  } catch (err) {
    console.error("Error getting participating races:", err);
    next(createError(500, "Failed to retrieve participating races."));
  }
};

export const joinRace = async (req, res, next) => {
  try {
    const { raceId } = req.params;
    const { password } = req.body;
    const currentUser = req.user;

    if (!mongoose.Types.ObjectId.isValid(raceId)) {
      return next(createError(400, "Invalid Race ID format."));
    }
    if (!currentUser) return next(createError(401, "User not authenticated."));

    const joinedRacesCount = await Participant.countDocuments({
      user: currentUser._id,
    });
    if (joinedRacesCount >= MAX_JOINED_RACES && !currentUser.isPremium) {
      return next(
        createError(
          403,
          `You have reached the maximum limit of ${MAX_JOINED_RACES} joined races. Consider upgrading to premium for more.`
        )
      );
    }

    const race = await Race.findById(raceId);
    if (!race) return next(createError(404, "Race not found."));

    const currentParticipantCount = await Participant.countDocuments({
      race: raceId,
    });
    if (currentParticipantCount >= MAX_RACE_PARTICIPANTS) {
      return next(
        createError(
          403,
          `This race has reached its maximum participant limit of ${MAX_RACE_PARTICIPANTS}.`
        )
      );
    }

    const existingParticipant = await Participant.findOne({
      race: raceId,
      user: currentUser._id,
    });
    if (existingParticipant) {
      return next(
        createError(409, "You are already a participant in this race.")
      );
    }

    if (race.isPrivate) {
      if (race.password !== password) {
        return next(createError(401, "Incorrect password for private race."));
      }
    }

    const newParticipant = new Participant({
      race: raceId,
      user: currentUser._id,
    });
    const savedParticipant = await newParticipant.save();
    await savedParticipant.populate({
      path: "user",
      model: "User",
    });

    const participantSummary = convertToParticipantSummaryDTO(
      savedParticipant,
      race,
      req.user
    );
    res.status(200).json(participantSummary);
  } catch (err) {
    console.error("Error joining race:", err);
    if (err.code === 11000) {
      return next(
        createError(
          409,
          "You are already a participant in this race (duplicate entry)."
        )
      );
    }
    next(createError(500, err.message || "Could not join race."));
  }
};

export const removeParticipant = async (req, res, next) => {
  try {
    const { raceId, participantId } = req.params;
    const requester = req.user;

    if (
      !mongoose.Types.ObjectId.isValid(raceId) ||
      !mongoose.Types.ObjectId.isValid(participantId)
    ) {
      return next(createError(400, "Invalid Race or Participant ID format."));
    }

    const race = await Race.findById(raceId);
    if (!race) return next(createError(404, "Race not found."));

    const participantToDelete = await Participant.findById(participantId);
    if (!participantToDelete)
      return next(createError(404, "Participant not found."));

    if (participantToDelete.race.toString() !== raceId) {
      return next(
        createError(400, "Participant does not belong to this race.")
      );
    }

    const isRequesterOrganiser =
      race.organiser.toString() === requester._id.toString();
    const isDeletingSelf =
      participantToDelete.user.toString() === requester._id.toString();

    if (!isRequesterOrganiser && !isDeletingSelf) {
      return next(
        createError(403, "You are not authorized to remove this participant.")
      );
    }

    await Participant.findByIdAndDelete(participantId);
    res.status(204).send();
  } catch (err) {
    console.error("Error removing participant:", err);
    next(createError(500, err.message || "Failed to remove participant."));
  }
};

export const getStravaActivitiesForRace = async (req, res, next) => {
  try {
    const { raceId } = req.params;
    const passportUser = req.user;

    if (!mongoose.Types.ObjectId.isValid(raceId)) {
      return next(createError(400, "Invalid Race ID format."));
    }
    if (!passportUser) return next(createError(401, "User not authenticated."));

    const race = await Race.findById(raceId);
    if (!race) return next(createError(404, "Race not found."));
    if (!race.startDate || !race.endDate)
      return next(createError(400, "Race is missing start or end date."));

    const activities = await fetchUserActivitiesFromStrava(
      passportUser,
      new Date(race.startDate),
      new Date(race.endDate)
    );
    res.status(200).json(activities);
  } catch (err) {
    console.error(
      `Error in getStravaActivitiesForRace for race ${req.params.raceId}:`,
      err
    );
    if (err instanceof createError.HttpError) return next(err);
    next(
      createError(
        err.status || 500,
        err.message || "Failed to get Strava activities for race."
      )
    );
  }
};

export const submitStravaActivityForRace = async (req, res, next) => {
  try {
    const { raceId } = req.params;
    const { activityId } = req.body;
    const passportUser = req.user;

    if (!mongoose.Types.ObjectId.isValid(raceId)) {
      return next(createError(400, "Invalid Race ID format."));
    }
    if (!passportUser) return next(createError(401, "User not authenticated."));
    if (!activityId) return next(createError(400, "Activity ID is required."));

    await processActivityForRace(passportUser, raceId, activityId);
    res
      .status(200)
      .json({ message: "Activity submitted and processed successfully." });
  } catch (err) {
    console.error(
      `Error submitting Strava activity for race ${req.params.raceId}:`,
      err
    );
    if (err instanceof createError.HttpError) return next(err);
    next(
      createError(
        err.status || 500,
        err.message || "Failed to submit Strava activity."
      )
    );
  }
};
