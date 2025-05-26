// /routes/authRoutes.js
import express from "express";
import {
  stravaLogin,
  stravaCallback,
  logoutUser,
} from "../controllers/authController.js";
// getCurrentUser is no longer handled here, but directly in server.js for /api/user/me
import { isAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

// Route to initiate Strava OAuth flow (this is the base /api/auth/strava)
// The /oauth2/authorization/strava is an alias handled in server.js
router.get("/strava", stravaLogin);

// Strava OAuth callback URL (e.g., /api/auth/strava/callback)
router.get("/strava/callback", stravaCallback);

// Logout (protected)
router.post("/logout", isAuthenticated, logoutUser);

export default router;
