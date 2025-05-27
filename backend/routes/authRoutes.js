import express from "express";
import {
  stravaLogin,
  stravaCallback,
  logoutUser,
} from "../controllers/authController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/strava", stravaLogin);

router.get("/strava/callback", stravaCallback);

router.post("/logout", isAuthenticated, logoutUser);

export default router;
