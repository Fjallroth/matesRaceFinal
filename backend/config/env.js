// /config/env.js
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

export default {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 8080,
  MONGO_URI:
    process.env.NODE_ENV === "docker"
      ? process.env.MONGO_URI
      : process.env.MONGO_URI_LOCAL,
  STRAVA_CLIENT_ID: process.env.STRAVA_CLIENT_ID,
  STRAVA_CLIENT_SECRET: process.env.STRAVA_CLIENT_SECRET,
  STRAVA_CALLBACK_URL:
    process.env.NODE_ENV === "production"
      ? process.env.STRAVA_CALLBACK_URL_PROD
      : process.env.STRAVA_CALLBACK_URL,
  SESSION_SECRET: process.env.SESSION_SECRET,
  SESSION_MAX_AGE_MS: parseInt(
    process.env.SESSION_MAX_AGE_MS || "86400000",
    10
  ),
  FRONTEND_URL:
    process.env.NODE_ENV === "production"
      ? process.env.FRONTEND_URL_PROD
      : process.env.FRONTEND_URL,
  LOG_LEVEL: process.env.LOG_LEVEL,
  STRAVA_API_BASE_URL: process.env.STRAVA_API_BASE_URL,
};
