// /controllers/authController.js
import passport from "passport";
import config from "../config/env.js";
import createError from "http-errors";

export const stravaLogin = passport.authenticate("strava", {
  scope: "activity:read_all,profile:read_all",
});

export const stravaCallback = (req, res, next) => {
  passport.authenticate("strava", (err, user, info) => {
    if (err) {
      console.error("Strava auth error in callback:", err.message || err);
      const errorMessage =
        info && info.message
          ? info.message
          : err.message || "strava_auth_failed";
      return res.redirect(
        `${config.FRONTEND_URL}/login?error=${encodeURIComponent(errorMessage)}`
      );
    }
    if (!user) {
      console.warn("Strava auth: No user returned from strategy. Info:", info);
      const errorMessage =
        info && info.message ? info.message : "strava_no_user";
      return res.redirect(
        `${config.FRONTEND_URL}/login?error=${encodeURIComponent(errorMessage)}`
      );
    }

    console.log("User object from Strava strategy:", user);
    console.log("Is req.session available before logIn?", !!req.session);
    console.log("Is req._passport available before logIn?", !!req._passport);

    // **Diagnostic Step: Ensure req._passport.session is initialized**
    if (req._passport && typeof req._passport.session === "undefined") {
      console.warn(
        "req._passport.session was undefined, manually initializing as {}."
      );
      req._passport.session = {};
    }

    if (req._passport) {
      console.log(
        "Is req._passport.session an object (after potential init)?",
        typeof req._passport.session === "object" &&
          req._passport.session !== null
      );
    }

    req.logIn(user, (loginErr) => {
      if (loginErr) {
        console.error("Strava auth: Login error after callback:", loginErr);
        return res.redirect(`${config.FRONTEND_URL}/login?error=login_failed`);
      }
      console.log(
        "User successfully logged in, session should be established."
      );
      return res.redirect(`${config.FRONTEND_URL}/home`);
    });
  })(req, res, next);
};

export const getCurrentUser = (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) {
    return next(createError(401, "Not Authenticated"));
  }
  const user = req.user;
  const responseDetails = {
    name: user.stravaId.toString(),
    stravaId: user.stravaId.toString(),
    firstName: user.userStravaFirstName,
    lastName: user.userStravaLastName,
    profilePicture: user.userStravaPic,
    sex: user.userSex,
    city: user.userCity,
    state: user.userState,
    country: user.userCountry,
  };
  res.status(200).json(responseDetails);
};

export const logoutUser = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
      return next(createError(500, "Logout failed."));
    }
    req.session.destroy((sessionErr) => {
      if (sessionErr) {
        console.error("Session destruction error:", sessionErr);
        return next(createError(500, "Failed to clear session."));
      }
      res.clearCookie("connect.sid");
      res.status(200).json({ message: "Logout successful" });
    });
  });
};
