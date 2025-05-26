// /models/ParticipantSegmentResult.js
import mongoose from "mongoose";

const participantSegmentResultSchema = new mongoose.Schema({
  participant: {
    // ObjectId referencing the Participant document
    type: mongoose.Schema.Types.ObjectId,
    ref: "Participant",
    required: true,
  },
  segmentId: {
    // Strava Segment ID
    type: Number,
    required: true,
  },
  segmentName: {
    type: String,
  },
  elapsedTimeSeconds: {
    type: Number, // Stored in seconds
  },
  // No separate ID needed, as this will be a subdocument or referenced by Participant
});

// This schema will likely be embedded within the Participant schema
// or could be a separate collection if segment results are very numerous per participant
// For this conversion, let's plan to embed it in Participant for simplicity matching the Spring structure.

const ParticipantSegmentResult = mongoose.model(
  "ParticipantSegmentResult",
  participantSegmentResultSchema
);
export default ParticipantSegmentResult; // Export if it becomes a separate collection
// If embedded, you might not need to export the model directly, but rather use the schema.
