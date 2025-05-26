// /middleware/authMiddleware.js
import createError from "http-errors";
import Race from "../models/Race.js";
import mongoose from "mongoose";

export const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  if (req.headers.accept && req.headers.accept.includes("application/json")) {
    return next(createError(401, "User not authenticated. Please log in."));
  }
  res.status(401).redirect("/login");
};

export const isRaceOrganizer = async (req, res, next) => {
  try {
    const { id: raceId } = req.params; // <<< CHANGED: Destructure 'id' and alias to 'raceId'
    console.log(
      "[isRaceOrganizer] Received raceId (from req.params.id):",
      raceId
    );

    if (!raceId || !mongoose.Types.ObjectId.isValid(raceId)) {
      console.warn("[isRaceOrganizer] Invalid or missing raceId:", raceId);
      return next(createError(400, "Invalid or missing Race ID."));
    }

    const race = await Race.findById(raceId);
    console.log(
      "[isRaceOrganizer] Result of Race.findById(raceId):",
      race ? race._id.toString() : null
    );

    if (!race) {
      return next(createError(404, "Race not found."));
    }

    if (
      !req.user ||
      !race.organiser ||
      race.organiser.toString() !== req.user._id.toString()
    ) {
      console.warn(
        `[isRaceOrganizer] Auth failed: User ${req.user?._id} vs Organizer ${race.organiser}`
      );
      return next(
        createError(
          403,
          "You are not authorized to perform this action on this race."
        )
      );
    }
    req.race = race; // Attach race to request for next handler (deleteRace controller)
    return next();
  } catch (err) {
    console.error("[isRaceOrganizer] Error:", err);
    return next(
      createError(500, err.message || "Error checking race ownership.")
    );
  }
};
