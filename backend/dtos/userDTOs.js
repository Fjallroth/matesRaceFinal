// /dtos/userDTOs.js
import Joi from "joi";

// UserSummaryDTO equivalent for response shaping (not for validation here)
// Actual response shaping will be done in the controller.
// This file is more for request validation if needed for user routes (e.g., update profile)

// For /api/user/me response, the structure is derived from passport's profile
// and custom additions in the authController. No specific Joi schema for response here,
// but we can define one for request bodies if user update routes are added.
