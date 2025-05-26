// /config/passport.js
import passport from "passport";
// import { Strategy as StravaStrategy } from 'passport-strava-oauth2'; // Remove this
import { Strategy as OAuth2Strategy } from "passport-oauth2"; // Use this
import User from "../models/User.js";
import config from "./env.js";
import axios from "axios"; // For fetching user profile from Strava API

export default function (passportInstance) {
  passportInstance.use(
    "strava",
    new OAuth2Strategy(
      {
        // Give it a name like 'strava'
        authorizationURL: "https://www.strava.com/oauth/authorize",
        tokenURL: "https://www.strava.com/oauth/token",
        clientID: config.STRAVA_CLIENT_ID,
        clientSecret: config.STRAVA_CLIENT_SECRET,
        callbackURL: config.STRAVA_CALLBACK_URL,
        scope: "activity:read_all,profile:read_all", // Comma-separated string
        passReqToCallback: true,
      },
      async (
        req,
        accessToken,
        refreshToken,
        params,
        profileFromStrategy,
        done
      ) => {
        // Note: passport-oauth2's 'profile' argument is often empty or minimal.
        // We need to fetch the user profile from Strava's API using the accessToken.
        try {
          const stravaUserResponse = await axios.get(
            `${config.STRAVA_API_BASE_URL}/athlete`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );
          const stravaProfile = stravaUserResponse.data; // This is the Strava athlete object

          if (!stravaProfile || !stravaProfile.id) {
            return done(
              new Error("Failed to fetch Strava profile or ID missing."),
              false
            );
          }

          const stravaId = stravaProfile.id;
          let user = await User.findOne({ stravaId });

          const tokenExpiresAt = params.expires_at
            ? new Date(params.expires_at * 1000)
            : null;

          if (user) {
            user.displayName = `${stravaProfile.firstname || ""} ${
              stravaProfile.lastname || ""
            }`.trim();
            user.userStravaFirstName = stravaProfile.firstname;
            user.userStravaLastName = stravaProfile.lastname;
            user.userStravaPic =
              stravaProfile.profile_medium || stravaProfile.profile;
            user.userSex = stravaProfile.sex;
            user.userCity = stravaProfile.city;
            user.userState = stravaProfile.state;
            user.userCountry = stravaProfile.country;
            user.userStravaAccess = accessToken;
            user.userStravaRefresh = refreshToken || user.userStravaRefresh;
            user.userTokenExpire = tokenExpiresAt;
            await user.save();
            return done(null, user);
          } else {
            const newUser = new User({
              stravaId,
              displayName: `${stravaProfile.firstname || ""} ${
                stravaProfile.lastname || ""
              }`.trim(),
              userStravaFirstName: stravaProfile.firstname,
              userStravaLastName: stravaProfile.lastname,
              userStravaPic:
                stravaProfile.profile_medium || stravaProfile.profile,
              userSex: stravaProfile.sex,
              userCity: stravaProfile.city,
              userState: stravaProfile.state,
              userCountry: stravaProfile.country,
              userStravaAccess: accessToken,
              userStravaRefresh: refreshToken,
              userTokenExpire: tokenExpiresAt,
            });
            await newUser.save();
            return done(null, newUser);
          }
        } catch (err) {
          console.error(
            "Error in Strava OAuth2 strategy (direct):",
            err.response ? err.response.data : err.message
          );
          return done(err, false);
        }
      }
    )
  );

  passportInstance.serializeUser((user, done) => {
    console.log("Serializing user (id):", user.id); // user.id is Mongoose _id
    done(null, user.id);
  });

  passportInstance.deserializeUser(async (id, done) => {
    console.log("Deserializing with id:", id);
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
}
