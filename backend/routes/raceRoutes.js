import express from "express";
import {
  createRace,
  getAllRaces,
  getRaceById,
  editRace,
  deleteRace,
  getParticipatingRaces,
  joinRace,
  removeParticipant,
  getStravaActivitiesForRace,
  submitStravaActivityForRace,
} from "../controllers/raceController.js";
import {
  isAuthenticated,
  isRaceOrganizer,
} from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validationMiddleware.js";
import {
  raceCreateSchema,
  raceUpdateSchema,
  joinRaceSchema,
  submitActivitySchema,
} from "../dtos/raceDTOs.js";
import { joinRaceLimiter } from "../middleware/rateLimitMiddleware.js"; // Import the new middleware

const router = express.Router();
router.post(
  "/",
  isAuthenticated,
  validateRequest(raceCreateSchema),
  createRace
);
router.get("/", isAuthenticated, getAllRaces);
router.get("/:id", isAuthenticated, getRaceById);
router.put(
  "/:id",
  isAuthenticated,
  isRaceOrganizer,
  validateRequest(raceUpdateSchema),
  editRace
);
router.delete("/:id", isAuthenticated, isRaceOrganizer, deleteRace);

router.get("/participating", isAuthenticated, getParticipatingRaces);
router.post(
  "/:raceId/join",
  isAuthenticated,
  joinRaceLimiter, // Apply the rate limiter
  validateRequest(joinRaceSchema),
  joinRace
);
router.delete(
  "/:raceId/participants/:participantId",
  isAuthenticated,
  removeParticipant
);
router.get(
  "/:raceId/strava-activities",
  isAuthenticated,
  getStravaActivitiesForRace
);
router.post(
  "/:raceId/submit-activity",
  isAuthenticated,
  validateRequest(submitActivitySchema),
  submitStravaActivityForRace
);

export default router;
