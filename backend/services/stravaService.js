import axios from "axios";
import createError from "http-errors";
import config from "../config/env.js";
import User from "../models/User.js";
import Race from "../models/Race.js";
import Participant from "../models/Participant.js";

const stravaApi = axios.create({
  baseURL: config.STRAVA_API_BASE_URL,
});

const getAccessToken = async (passportUser) => {
  if (!passportUser || !passportUser.stravaId) {
    throw createError(401, "User principal is invalid for Strava API access.");
  }
  if (!passportUser.userStravaAccess) {
    throw createError(
      401,
      "Strava access token not available. Please re-authenticate."
    );
  }
  if (
    passportUser.userTokenExpire &&
    new Date(passportUser.userTokenExpire) < new Date()
  ) {
    console.warn(
      `Strava token for user ${passportUser.stravaId} has expired. Refresh needed.`
    );
    throw createError(
      401,
      "Strava access token has expired. Please re-authenticate or implement refresh logic."
    );
  }
  return passportUser.userStravaAccess;
};

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
        per_page: 50,
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
        startDateLocal: activity.start_date_local,
        distance: activity.distance,
        elapsedTime: activity.elapsed_time,
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

export const processAndSaveActivityResults = async (
  passportUser,
  raceId,
  stravaActivityId
) => {
  const accessToken = await getAccessToken(passportUser);
  const userStravaId = passportUser.stravaId;

  const user = await User.findById(passportUser.id);
  if (!user)
    throw createError(404, `User not found with DB ID: ${passportUser.id}`);

  const race = await Race.findById(raceId);
  if (!race) throw createError(404, `Race not found with ID: ${raceId}`);

  let participant = await Participant.findOne({ race: raceId, user: user.id });
  if (!participant) {
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
      params: { include_all_efforts: true },
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

  const raceSegmentIds = race.segmentIds;
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

  participant.segmentResults = newSegmentResults;
  participant.submittedRide = true;
  participant.submittedActivityId = stravaActivityId;

  await participant.save();
  console.info(
    `Successfully processed and saved activity ${stravaActivityId} for user ${userStravaId} in race ${raceId}`
  );
};
