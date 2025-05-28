import axios from "axios";
import createError from "http-errors";
import config from "../config/env.js";
import User from "../models/User.js";
import Race from "../models/Race.js";

const refreshStravaToken = async (stravaId, refreshToken) => {
  console.log(`Attempting to refresh Strava token for Strava ID: ${stravaId}`);
  try {
    const response = await axios.post(
      "https://www.strava.com/oauth/token",
      null,
      {
        params: {
          client_id: config.STRAVA_CLIENT_ID,
          client_secret: config.STRAVA_CLIENT_SECRET,
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const {
      access_token,
      expires_at,
      refresh_token: new_refresh_token,
    } = response.data;

    const userToUpdate = await User.findOne({ stravaId });
    if (!userToUpdate) {
      console.error(
        `User with Strava ID ${stravaId} not found during token refresh.`
      );
      return null;
    }

    userToUpdate.userStravaAccess = access_token;
    userToUpdate.userTokenExpire = new Date(expires_at * 1000);
    if (new_refresh_token) {
      userToUpdate.userStravaRefresh = new_refresh_token;
    }
    await userToUpdate.save();
    console.log(
      `Successfully refreshed Strava token for Strava ID: ${stravaId}`
    );

    return {
      accessToken: access_token,
      expiresAt: userToUpdate.userTokenExpire,
      newRefreshToken: new_refresh_token || userToUpdate.userStravaRefresh,
    };
  } catch (error) {
    console.error(
      `Error refreshing Strava token for Strava ID ${stravaId}:`,
      error.response?.data || error.message
    );

    if (
      error.response &&
      (error.response.status === 400 || error.response.status === 401)
    ) {
      const userToClear = await User.findOne({ stravaId });
      if (userToClear) {
        console.warn(
          `Clearing potentially invalid Strava tokens for Strava ID: ${stravaId} due to refresh error.`
        );
        userToClear.userStravaAccess = undefined;
        userToClear.userStravaRefresh = undefined;
        userToClear.userTokenExpire = undefined;
        await userToClear.save();
      }

      throw createError(
        401,
        "Strava refresh token invalid or expired. Please re-authenticate with Strava."
      );
    }

    throw createError(
      500,
      `Failed to refresh Strava token: ${
        error.response?.data?.message || error.message
      }`
    );
  }
};

const getAccessToken = async (passportUser) => {
  if (!passportUser || !passportUser.stravaId) {
    throw createError(401, "User principal is invalid for Strava API access.");
  }

  const bufferTime = 5 * 60 * 1000;
  const tokenExpireTime = passportUser.userTokenExpire
    ? new Date(passportUser.userTokenExpire).getTime()
    : 0;

  if (tokenExpireTime - bufferTime < Date.now()) {
    if (tokenExpireTime === 0) {
      console.warn(
        `Strava token expiry not set for user ${passportUser.stravaId}. Assuming expired/invalid. Attempting refresh if possible.`
      );
    } else {
      console.warn(
        `Strava token for user ${passportUser.stravaId} has expired or is about to expire. Attempting refresh.`
      );
    }

    if (!passportUser.userStravaRefresh) {
      console.error(
        `Strava refresh token not available for user ${passportUser.stravaId}. Re-authentication required.`
      );
      const userToClear = await User.findById(passportUser.id);
      if (userToClear) {
        userToClear.userStravaAccess = undefined;
        userToClear.userTokenExpire = undefined;
        await userToClear.save();
      }
      throw createError(
        401,
        "Strava access token expired and no refresh token available. Please re-authenticate with Strava."
      );
    }

    try {
      const refreshedData = await refreshStravaToken(
        passportUser.stravaId,
        passportUser.userStravaRefresh
      );

      if (!refreshedData) {
        throw createError(
          401,
          "User not found during token refresh process. Please re-authenticate."
        );
      }
      passportUser.userStravaAccess = refreshedData.accessToken;
      passportUser.userTokenExpire = refreshedData.expiresAt;
      passportUser.userStravaRefresh = refreshedData.newRefreshToken;

      return refreshedData.accessToken;
    } catch (refreshError) {
      throw refreshError;
    }
  }

  if (!passportUser.userStravaAccess) {
    console.warn(
      `Strava access token not found for user ${passportUser.stravaId}, though not detected as expired. Re-authentication advised.`
    );
    throw createError(
      401,
      "Strava access token not available. Please re-authenticate with Strava."
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
    `Fetching Strava activities for user ${passportUser.stravaId} between ${raceStartDate} and ${raceEndDate}`
  );

  try {
    const response = await axios.get(
      `${config.STRAVA_API_BASE_URL}/athlete/activities`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          before: beforeTimestamp,
          after: afterTimestamp,
          per_page: 50,
        },
      }
    );

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
        err.message.includes("re-authenticate")
          ? err.message
          : "Strava authentication error after attempting refresh. Please re-authenticate."
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
      `Fetching detailed Strava activity ${stravaActivityId} for user ${userStravaId}`
    );
    const response = await axios.get(
      `${config.STRAVA_API_BASE_URL}/activities/${stravaActivityId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { include_all_efforts: true },
      }
    );
    activityDetails = response.data;
  } catch (err) {
    console.error(
      `Error fetching Strava activity details for activity ${stravaActivityId}:`,
      err.response?.data || err.message
    );
    if (err.response?.status === 401) {
      throw createError(
        401,
        err.message.includes("re-authenticate")
          ? err.message
          : "Strava authentication error after attempting refresh. Please re-authenticate."
      );
    }
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
