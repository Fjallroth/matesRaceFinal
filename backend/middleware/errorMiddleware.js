// /middleware/errorMiddleware.js
import config from "../config/env.js";

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500; // Use err.status from http-errors

  console.error(
    `[${new Date().toISOString()}] ${req.method} ${
      req.originalUrl
    } - Status: ${statusCode} - Error: ${err.message}`,
    config.NODE_ENV === "development" ? err.stack : {}
  );

  res.status(statusCode).json({
    message: err.message || "An unexpected error occurred.",
    // Provide stack trace only in development
    stack: config.NODE_ENV === "development" ? err.stack : undefined,
    details:
      err.details ||
      (err.errors ? err.errors.map((e) => e.message) : undefined), // For Joi validation errors
  });
};

export default errorHandler;
