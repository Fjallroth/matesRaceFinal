// /routes/raceRoutes.js
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

const router = express.Router();

// === Race CRUD ===
router.post(
  "/",
  isAuthenticated,
  validateRequest(raceCreateSchema),
  createRace
);
router.get("/", isAuthenticated, getAllRaces); // Publicly viewable in Spring, make authenticated here
router.get("/:id", isAuthenticated, getRaceById);
router.put(
  "/:id",
  isAuthenticated,
  isRaceOrganizer,
  validateRequest(raceUpdateSchema),
  editRace
);
router.delete("/:id", isAuthenticated, isRaceOrganizer, deleteRace);

// === Race Participation ===
router.get("/participating", isAuthenticated, getParticipatingRaces); // Get races user is in
router.post(
  "/:raceId/join",
  isAuthenticated,
  validateRequest(joinRaceSchema),
  joinRace
);
router.delete(
  "/:raceId/participants/:participantId",
  isAuthenticated,
  removeParticipant
); // Organizer or self can remove

// === Strava Activity Interaction ===
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
