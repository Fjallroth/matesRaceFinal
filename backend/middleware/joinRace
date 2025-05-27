import createError from "http-errors";

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 10;

const requestTimestamps = new Map();

export const joinRaceLimiter = (req, res, next) => {
  const key = req.user ? req.user.id : req.ip;

  const now = Date.now();
  const userRequests = requestTimestamps.get(key) || [];

  const recentRequests = userRequests.filter(
    (timestamp) => timestamp > now - RATE_LIMIT_WINDOW_MS
  );

  if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    return next(
      createError(
        429,
        "Too many attempts to join races. Please try again later."
      )
    );
  }

  recentRequests.push(now);
  requestTimestamps.set(key, recentRequests);

  next();
};
