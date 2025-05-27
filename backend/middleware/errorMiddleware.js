import config from "../config/env.js";

const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;
  console.error(
    `[${new Date().toISOString()}] ${req.method} ${
      req.originalUrl
    } - Status: ${statusCode} - Error: ${err.message}`,
    config.NODE_ENV === "development" ? err.stack : {}
  );

  res.status(statusCode).json({
    message: err.message || "An unexpected error occurred.",
    stack: config.NODE_ENV === "development" ? err.stack : undefined,
    details:
      err.details ||
      (err.errors ? err.errors.map((e) => e.message) : undefined),
  });
};

export default errorHandler;
