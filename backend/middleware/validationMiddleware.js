// /middleware/validationMiddleware.js
import createError from "http-errors";

export const validateRequest = (schema, property = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Return all errors
      stripUnknown: true, // Remove unknown keys
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");
      return next(createError(400, errorMessage, { details: error.details }));
    }

    req[property] = value; // Assign validated and possibly transformed value
    return next();
  };
};
