// server.js
import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";

import config from "./config/env.js";
import connectDB from "./config/db.js";
import passportConfig from "./config/passport.js";
import errorHandler from "./middleware/errorMiddleware.js";

// Import controllers and middleware needed for specific route overrides
import {
  stravaLogin as stravaLoginController,
  getCurrentUser as getCurrentUserController,
} from "./controllers/authController.js";
import { isAuthenticated as isAuthenticatedMiddleware } from "./middleware/authMiddleware.js";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import raceRoutes from "./routes/raceRoutes.js";

// Import models (can be useful for app.get('models') pattern if you prefer)
import User from "./models/User.js";
import Race from "./models/Race.js";
import Participant from "./models/Participant.js";
import ParticipantSegmentResult from "./models/ParticipantSegmentResult.js";

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
if (config.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(
  cors({
    origin: config.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session configuration
app.use(
  session({
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: config.MONGO_URI,
      collectionName: "sessions",
      ttl: config.SESSION_MAX_AGE_MS / 1000,
    }),
    cookie: {
      secure: config.NODE_ENV === "production",
      httpOnly: true,
      maxAge: config.SESSION_MAX_AGE_MS,
      sameSite: config.NODE_ENV === "production" ? "lax" : "lax",
    },
  })
);
app.use((req, res, next) => {
  req.session.testCounter = (req.session.testCounter || 0) + 1;
  console.log(
    `Session ID: ${req.sessionID}, Counter: ${req.session.testCounter}`
  );
  if (req.user) console.log("req.user in test middleware:", req.user.id);
  next();
});

// Passport middleware initialization
passportConfig(passport);
app.use(passport.initialize());
app.use(passport.session());

app.set("models", { User, Race, Participant, ParticipantSegmentResult });

// --- Specific Route Overrides & Aliases ---

// Alias for Spring Boot default OAuth2 login initiation path
// The frontend calls this directly on the backend URL.
app.get("/oauth2/authorization/strava", stravaLoginController);

// Route for frontend's expectation of /api/user/me (proxied by Vite)
app.get("/api/user/me", isAuthenticatedMiddleware, getCurrentUserController);

// --- Main API Routers ---
app.get("/", (req, res) => res.send("MatesRace API Running!"));
app.use("/api/auth", authRoutes); // For other auth routes like /callback, /logout
app.use("/api/users", userRoutes);
app.use("/api/races", raceRoutes);

// Global error handler
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB(); // Ensure DB is connected before starting the server

    // Passport middleware initialization (depends on User model, so after DB connect)
    passportConfig(passport); // Pass the passport instance
    app.use(passport.initialize());
    app.use(passport.session());

    // Make models accessible (alternative pattern)
    app.set("models", { User, Race, Participant, ParticipantSegmentResult });

    // --- Specific Route Overrides & Aliases ---
    // ... (your existing route overrides)

    // --- Main API Routers ---
    // ... (your existing app.use for routes)

    // Global error handler (must be last middleware using routes)
    app.use(errorHandler);

    app.listen(config.PORT, () => {
      console.log(
        `Server running in ${config.NODE_ENV} mode on port ${config.PORT}`
      );
      console.log("Mongo URI from config:", config.MONGO_URI);
      console.log(`Frontend URL configured: ${config.FRONTEND_URL}`);
      console.log(
        `Strava Callback URL configured: ${config.STRAVA_CALLBACK_URL}`
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
