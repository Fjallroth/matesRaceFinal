// /dtos/raceDTOs.js
import Joi from "joi";

// RaceCreateDTO
export const raceCreateSchema = Joi.object({
  raceName: Joi.string().min(3).required().messages({
    "string.min": "Race name must be at least 3 characters.",
    "any.required": "Race name is required.",
  }),
  description: Joi.string().optional().allow(""),
  startDate: Joi.date().iso().required().messages({
    // Expect ISO string from frontend
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
    // Always required as races are private
    "string.min": "Password must be at least 4 characters.",
    "any.required": "Password is required for private races.",
  }),
  hideLeaderboardUntilFinish: Joi.boolean().default(false),
  useSexCategories: Joi.boolean().default(false),
});

// RaceUpdateDTO (similar to create, but password can be optional if not changing)
export const raceUpdateSchema = Joi.object({
  raceName: Joi.string().min(3).optional(),
  description: Joi.string().optional().allow(""),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional().greater(Joi.ref("startDate")),
  segmentIds: Joi.array().items(Joi.number().positive()).min(1).optional(),
  password: Joi.string().min(4).optional().allow(""), // Optional: only if changing
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

// JoinRaceRequestDto
export const joinRaceSchema = Joi.object({
  password: Joi.string().required().allow("").messages({
    // Password might be empty for public races if that feature is re-enabled
    "any.required": "Password is required to join this race.", // Adjusted message
  }),
});

// SubmitActivityRequestDTO
export const submitActivitySchema = Joi.object({
  activityId: Joi.number().positive().required().messages({
    "number.base": "Activity ID must be a number.",
    "any.required": "Activity ID is required.",
  }),
});

// DTOs for responses (ParticipantSegmentResultDTO, ParticipantSummaryDTO, UserSummaryDTO, RaceResponseDTO, StravaActivityDTO)
// In Node.js/Express, you typically shape these objects directly in your controllers/services
// before sending the response, rather than defining strict DTO classes like in Java.
// TypeScript interfaces would be used here if this were a TypeScript project.
