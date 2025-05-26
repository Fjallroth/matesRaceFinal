// /controllers/raceController.js
import createError from "http-errors";
import mongoose from "mongoose";
import Race from "../models/Race.js";
import User from "../models/User.js";
import Participant from "../models/Participant.js";
import {
  // Assuming stravaService methods are exported
  getUserActivities as fetchUserActivitiesFromStrava,
  processAndSaveActivityResults as processActivityForRace,
} from "../services/stravaService.js";

// Helper to convert DB Race to RaceResponseDTO structure
// Note: In Node, you often just pick the fields or use a library like lodash.pick
// For consistency with Java DTOs, we'll try to shape it similarly.
const convertToRaceResponseDTO = async (
  race,
  includeParticipantsDetails = false,
  currentUserPassport = null
) => {
  if (!race) return null;

  let populatedRace = race;
  if (!race.populated("organiser")) {
    populatedRace = await race.populate("organiser");
  }

  let participantCount = 0;
  let participantDTOs = [];

  if (includeParticipantsDetails) {
    const participants = await Participant.find({ race: race._id })
      .populate("user")
      .populate("segmentResults");
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
    populatedRace.organiser.id.toString() === currentUserPassport.id.toString()
  ) {
    racePassword = race.password; // Organiser sees the plaintext password (if stored that way)
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
    password: racePassword, // Only if current user is organizer
  };
};

const convertToUserSummaryDTO = (user) => {
  if (!user) return null;
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
  if (!participant) return null;

  const currentUserId = currentUserPassport
    ? currentUserPassport.stravaId
    : null;
  const isOrganiser =
    raceContext.organiser &&
    currentUserPassport &&
    raceContext.organiser.id.toString() === currentUserPassport.id.toString();
  const raceFinished =
    raceContext.endDate && new Date(raceContext.endDate) < new Date();
  const isCurrentParticipant =
    participant.user &&
    currentUserPassport &&
    participant.user.stravaId === currentUserId;

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

// POST /api/races - Create Race
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
    const organiserUser = req.user; // From passport session (Mongoose User doc)

    if (!organiserUser) {
      return next(createError(401, "User not authenticated"));
    }

    const newRace = new Race({
      raceName,
      raceInfo: description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      segmentIds,
      organiser: organiserUser._id, // Store ObjectId of the user
      isPrivate: true, // Forced private
      password, // Store password (consider hashing if it were for login)
      hideLeaderboardUntilFinish,
      useSexCategories,
    });

    const savedRace = await newRace.save();

    // Automatically add organiser as participant
    const organiserParticipant = new Participant({
      race: savedRace._id,
      user: organiserUser._id,
      submittedRide: false, // Organiser might not submit a ride by default
    });
    await organiserParticipant.save();

    // Populate organiser for the response DTO
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

// GET /api/races - Get All Races
export const getAllRaces = async (req, res, next) => {
  try {
    const races = await Race.find()
      .populate("organiser")
      .sort({ createdAt: -1 });
    // For "all races" view, participant details might not be needed for each card to save data
    const raceDTOs = await Promise.all(
      races.map((race) => convertToRaceResponseDTO(race, false, req.user))
    );
    res.status(200).json(raceDTOs);
  } catch (err) {
    console.error("Error getting all races:", err);
    next(createError(500, "Failed to retrieve races."));
  }
};

// GET /api/races/:id - Get Race By ID
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
    const responseDTO = await convertToRaceResponseDTO(race, true, req.user); // Include participant details
    res.status(200).json(responseDTO);
  } catch (err) {
    console.error(`Error getting race by ID ${req.params.id}:`, err);
    next(createError(500, "Failed to retrieve race details."));
  }
};

// PUT /api/races/:id - Edit Race
export const editRace = async (req, res, next) => {
  try {
    const { id: raceId } = req.params;
    const updates = req.body; // Validated by Joi middleware
    const currentUser = req.user;

    if (!mongoose.Types.ObjectId.isValid(raceId)) {
      return next(createError(400, "Invalid Race ID format."));
    }

    const raceToUpdate = await Race.findById(raceId);
    if (!raceToUpdate) {
      return next(createError(404, `Race not found with ID: ${raceId}`));
    }

    // Authorization: Only organiser can edit
    if (raceToUpdate.organiser.toString() !== currentUser._id.toString()) {
      return next(
        createError(403, "You are not authorized to edit this race.")
      );
    }

    // Apply updates
    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        // Allow clearing optional fields like description
        if (key === "startDate" || key === "endDate") {
          raceToUpdate[key] = new Date(updates[key]);
        } else if (key === "password" && updates[key] === "") {
          // If password sent as empty, ignore (don't clear existing password)
          // If truly want to clear password, need specific handling (but races are forced private)
        } else if (key === "password" && updates[key]) {
          // Password change logic (if any hashing is done, do it here or in pre-save)
          raceToUpdate[key] = updates[key];
        } else {
          raceToUpdate[key] = updates[key];
        }
      }
    });
    raceToUpdate.isPrivate = true; // Ensure it remains private

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

// DELETE /api/races/:id - Delete Race
export const deleteRace = async (req, res, next) => {
  try {
    const { id: raceId } = req.params;
    console.log(
      `Attempting to delete race with ID string from params: ${raceId}`
    );
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

    // Delete associated participants
    await Participant.deleteMany({ race: raceId });
    // await ParticipantSegmentResult.deleteMany({ /* need a way to link to race or participant */ });
    // If ParticipantSegmentResult is embedded in Participant, this is handled by deleting Participants.

    await Race.findByIdAndDelete(raceId);
    res.status(204).send(); // No content
  } catch (err) {
    console.error("Error deleting race:", err);
    next(createError(500, err.message || "Failed to delete race."));
  }
};

// GET /api/races/participating - Get races user is participating in
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

    const races = participations.map((p) => p.race).filter(Boolean); // Filter out any null races if a participation doc somehow exists without one

    const raceDTOs = await Promise.all(
      races.map((race) => convertToRaceResponseDTO(race, false, req.user))
    );
    res.status(200).json(raceDTOs);
  } catch (err) {
    console.error("Error getting participating races:", err);
    next(createError(500, "Failed to retrieve participating races."));
  }
};

// POST /api/races/:raceId/join - Join a race
export const joinRace = async (req, res, next) => {
  try {
    const { raceId } = req.params;
    const { password } = req.body;
    const currentUser = req.user;

    if (!mongoose.Types.ObjectId.isValid(raceId)) {
      return next(createError(400, "Invalid Race ID format."));
    }
    if (!currentUser) return next(createError(401, "User not authenticated."));

    const race = await Race.findById(raceId);
    if (!race) return next(createError(404, "Race not found."));

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
      // In Node, if passwords are plain text for race entry (not login), direct compare.
      // If they were hashed (e.g. with bcrypt), you'd compare hashes.
      // The Java app seems to store race passwords plaintext or a reversible form for this check.
      if (race.password !== password) {
        return next(createError(401, "Incorrect password for private race."));
      }
    }

    const newParticipant = new Participant({
      race: raceId,
      user: currentUser._id,
    });
    const savedParticipant = await newParticipant.save();
    await savedParticipant.populate("user"); // Populate user for the DTO

    const participantSummary = convertToParticipantSummaryDTO(
      savedParticipant,
      race,
      req.user
    );
    res.status(200).json(participantSummary); // 200 OK or 201 Created
  } catch (err) {
    console.error("Error joining race:", err);
    if (err.code === 11000) {
      // Mongo duplicate key error
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

// DELETE /api/races/:raceId/participants/:participantId - Delete/Remove a participant
export const removeParticipant = async (req, res, next) => {
  try {
    const { raceId, participantId } = req.params;
    const requester = req.user; // Authenticated user

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

    // Check if participant belongs to the specified race
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

// GET /api/races/:raceId/strava-activities - Get Strava activities for the race period
export const getStravaActivitiesForRace = async (req, res, next) => {
  try {
    const { raceId } = req.params;
    const passportUser = req.user; // User from Passport session

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
    // Pass HttpError directly if it's from stravaService
    if (err instanceof createError.HttpError) return next(err);
    next(
      createError(
        err.status || 500,
        err.message || "Failed to get Strava activities for race."
      )
    );
  }
};

// POST /api/races/:raceId/submit-activity - Submit a Strava activity for the race
export const submitStravaActivityForRace = async (req, res, next) => {
  try {
    const { raceId } = req.params;
    const { activityId } = req.body; // Validated by Joi
    const passportUser = req.user;

    if (!mongoose.Types.ObjectId.isValid(raceId)) {
      return next(createError(400, "Invalid Race ID format."));
    }
    if (!passportUser) return next(createError(401, "User not authenticated."));
    if (!activityId) return next(createError(400, "Activity ID is required."));

    // Authorization: Ensure user is a participant (implicitly checked by processAndSaveActivityResults)
    // The service `processAndSaveActivityResults` will also check if user is a participant
    await processActivityForRace(passportUser, raceId, activityId);
    res
      .status(200)
      .json({ message: "Activity submitted and processed successfully." }); // Or 204 No Content
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
