import Joi from "joi";

export const raceCreateSchema = Joi.object({
  raceName: Joi.string().min(3).required().messages({
    "string.min": "Race name must be at least 3 characters.",
    "any.required": "Race name is required.",
  }),
  description: Joi.string().optional().allow(""),
  startDate: Joi.date().iso().required().messages({
    "date.base": "Start date must be a valid date.",
    "any.required": "Start date is required.",
  }),
  endDate: Joi.date().iso().required().greater(Joi.ref("startDate")).messages({
    "date.base": "End date must be a valid date.",
    "date.greater": "End date must be after start date.",
    "any.required": "End date is required.",
  }),
  segmentIds: Joi.array()
    .items(Joi.number().positive())
    .min(1)
    .required()
    .messages({
      "array.min": "At least one segment ID is required.",
      "any.required": "Segment IDs are required.",
      "number.base": "Segment ID must be a number.",
    }),
  password: Joi.string().min(4).required().messages({
    "string.min": "Password must be at least 4 characters.",
    "any.required": "Password is required for private races.",
  }),
  hideLeaderboardUntilFinish: Joi.boolean().default(false),
  useSexCategories: Joi.boolean().default(false),
});

export const raceUpdateSchema = Joi.object({
  raceName: Joi.string().min(3).optional(),
  description: Joi.string().optional().allow(""),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional().greater(Joi.ref("startDate")),
  segmentIds: Joi.array().items(Joi.number().positive()).min(1).optional(),
  password: Joi.string().min(4).optional().allow(""),
  hideLeaderboardUntilFinish: Joi.boolean().optional(),
  useSexCategories: Joi.boolean().optional(),
}).when(
  Joi.object({ startDate: Joi.exist(), endDate: Joi.exist() }).unknown(),
  {
    then: Joi.object({
      endDate: Joi.date()
        .iso()
        .required()
        .greater(Joi.ref("startDate"))
        .messages({
          "date.greater":
            "End date must be after start date if both dates are provided.",
        }),
    }),
  }
);

export const joinRaceSchema = Joi.object({
  password: Joi.string().required().allow("").messages({
    "any.required": "Password is required to join this race.",
  }),
});

export const submitActivitySchema = Joi.object({
  activityId: Joi.number().positive().required().messages({
    "number.base": "Activity ID must be a number.",
    "any.required": "Activity ID is required.",
  }),
});
