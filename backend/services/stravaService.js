// /services/stravaService.js
import axios from "axios";
import createError from "http-errors";
import config from "../config/env.js";
import User from "../models/User.js"; // Assuming models are directly importable
import Race from "../models/Race.js";
import Participant from "../models/Participant.js";
// ParticipantSegmentResult is embedded, so not imported as a separate model for direct ops here

const stravaApi = axios.create({
  baseURL: config.STRAVA_API_BASE_URL,
});

/**
 * Retrieves the access token for the authenticated user.
 * @param {object} passportUser - The user object from Passport (req.user)
 * @returns {string} The Strava access token.
 * @throws {Error} If the token is not available.
 */
const getAccessToken = async (passportUser) => {
  if (!passportUser || !passportUser.stravaId) {
    throw createError(401, "User principal is invalid for Strava API access.");
  }
  // The user object from deserializeUser should have the tokens if they are stored
  if (!passportUser.userStravaAccess) {
    // Potentially try to refresh token here if you have a refresh token
    // For now, assume it's up-to-date or user needs to re-auth
    throw createError(
      401,
      "Strava access token not available. Please re-authenticate."
    );
  }
  // Check for token expiry if `userTokenExpire` is available
  if (
    passportUser.userTokenExpire &&
    new Date(passportUser.userTokenExpire) < new Date()
  ) {
    // TODO: Implement token refresh logic here if `userStravaRefresh` is available
    console.warn(
      `Strava token for user ${passportUser.stravaId} has expired. Refresh needed.`
    );
    // For now, throw error. In a real app, you'd attempt refresh.
    throw createError(
      401,
      "Strava access token has expired. Please re-authenticate or implement refresh logic."
    );
  }
  return passportUser.userStravaAccess;
};

/**
 * Fetches user activities from Strava API within a given date range.
 * @param {object} passportUser - The authenticated user from Passport.
 * @param {Date} raceStartDate - The start date of the race.
 * @param {Date} raceEndDate - The end date of the race.
 * @returns {Promise<Array<object>>} A list of Strava activity DTOs.
 */
export const getUserActivities = async (
  passportUser,
  raceStartDate,
  raceEndDate
) => {
  const accessToken = await getAccessToken(passportUser);
  const afterTimestamp = Math.floor(raceStartDate.getTime() / 1000);
  const beforeTimestamp = Math.floor(raceEndDate.getTime() / 1000);

  console.debug(
    `Workspaceing Strava activities for user ${passportUser.stravaId} between ${raceStartDate} and ${raceEndDate}`
  );

  try {
    const response = await stravaApi.get("/athlete/activities", {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        before: beforeTimestamp,
        after: afterTimestamp,
        per_page: 50, // Match Java service
      },
    });

    if (!response.data) {
      console.info(
        `Strava API returned no activities for user ${passportUser.stravaId}.`
      );
      return [];
    }

    return response.data
      .filter(
        (activity) =>
          activity &&
          typeof activity.type === "string" &&
          activity.type.toLowerCase() === "ride"
      )
      .map((activity) => ({
        id: activity.id,
        name: activity.name,
        startDateLocal: activity.start_date_local, // ISO 8601 format
        distance: activity.distance, // in meters
        elapsedTime: activity.elapsed_time, // in seconds
        type: activity.type,
      }));
  } catch (err) {
    console.error(
      `Error fetching Strava activities for user ${passportUser.stravaId}:`,
      err.response?.data || err.message
    );
    if (err.response?.status === 401) {
      throw createError(
        401,
        "Strava authentication error. Please re-authenticate."
      );
    }
    throw createError(
      err.response?.status || 500,
      `Failed to fetch activities from Strava: ${
        err.response?.data?.message || err.message
      }`
    );
  }
};

/**
 * Processes and saves segment results from a submitted Strava activity for a race participant.
 * @param {object} passportUser - The authenticated user from Passport.
 * @param {string} raceId - The ID of the race.
 * @param {number} stravaActivityId - The ID of the Strava activity.
 */
export const processAndSaveActivityResults = async (
  passportUser,
  raceId,
  stravaActivityId
) => {
  const accessToken = await getAccessToken(passportUser);
  const userStravaId = passportUser.stravaId;

  const user = await User.findById(passportUser.id); // passportUser.id is the MongoDB ObjectId
  if (!user)
    throw createError(404, `User not found with DB ID: ${passportUser.id}`);

  const race = await Race.findById(raceId);
  if (!race) throw createError(404, `Race not found with ID: ${raceId}`);

  let participant = await Participant.findOne({ race: raceId, user: user.id });
  if (!participant) {
    // This case should ideally be handled by the joinRace endpoint.
    // If a user tries to submit to a race they haven't joined.
    // The RaceApiController in Java creates participant if not found during submission,
    // but it's generally better if they are already a participant.
    // For now, we'll throw an error if they are not a participant.
    console.warn(
      `User ${userStravaId} (DB ID ${user.id}) tried to submit to race ${raceId} without being a participant.`
    );
    throw createError(
      403,
      "You are not a participant in this race. Please join the race first."
    );
  }

  let activityDetails;
  try {
    console.debug(
      `Workspaceing detailed Strava activity ${stravaActivityId} for user ${userStravaId}`
    );
    const response = await stravaApi.get(`/activities/${stravaActivityId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { include_all_efforts: true }, // Ensure segment efforts are included
    });
    activityDetails = response.data;
  } catch (err) {
    console.error(
      `Error fetching Strava activity details for activity ${stravaActivityId}:`,
      err.response?.data || err.message
    );
    throw createError(
      err.response?.status || 500,
      `Failed to fetch activity details from Strava: ${
        err.response?.data?.message || err.message
      }`
    );
  }

  if (!activityDetails) {
    throw createError(400, "Fetched activity details from Strava are null.");
  }
  if (
    !activityDetails.segment_efforts ||
    !Array.isArray(activityDetails.segment_efforts)
  ) {
    console.warn(
      `No segment_efforts list found in Strava activity ${stravaActivityId} for user ${userStravaId}. Activity Data:`,
      activityDetails
    );
    throw createError(
      400,
      "Selected activity does not contain valid segment efforts."
    );
  }

  const raceSegmentIds = race.segmentIds; // Array of numbers
  const newSegmentResults = [];

  for (const effort of activityDetails.segment_efforts) {
    if (
      !effort ||
      !effort.segment ||
      typeof effort.segment.id !== "number" ||
      typeof effort.elapsed_time !== "number"
    ) {
      console.warn(
        `Skipping invalid segment effort in activity ${stravaActivityId}:`,
        effort
      );
      continue;
    }
    const segmentEffortId = effort.segment.id;
    if (raceSegmentIds.includes(segmentEffortId)) {
      newSegmentResults.push({
        segmentId: segmentEffortId,
        segmentName: effort.segment.name || "Unnamed Segment",
        elapsedTimeSeconds: effort.elapsed_time,
      });
    }
  }

  participant.segmentResults = newSegmentResults; // Replace existing results
  participant.submittedRide = true;
  participant.submittedActivityId = stravaActivityId;

  await participant.save();
  console.info(
    `Successfully processed and saved activity ${stravaActivityId} for user ${userStravaId} in race ${raceId}`
  );
};
