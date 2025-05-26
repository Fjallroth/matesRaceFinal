// /models/Participant.js
import mongoose from "mongoose";

// Define the schema for embedded ParticipantSegmentResult
const embeddedParticipantSegmentResultSchema = new mongoose.Schema(
  {
    segmentId: { type: Number, required: true },
    segmentName: String,
    elapsedTimeSeconds: Number,
  },
  { _id: false }
); // _id: false for subdocuments if you don't need separate IDs

const participantSchema = new mongoose.Schema({
  race: {
    // ObjectId referencing the Race document
    type: mongoose.Schema.Types.ObjectId,
    ref: "Race",
    required: true,
  },
  user: {
    // ObjectId referencing the User document (the participant)
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  submittedRide: {
    type: Boolean,
    default: false,
  },
  submittedActivityId: {
    // Strava Activity ID
    type: Number,
  },
  segmentResults: [embeddedParticipantSegmentResultSchema], // Embed segment results
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index to ensure a user can only join a race once
participantSchema.index({ race: 1, user: 1 }, { unique: true });

participantSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Participant = mongoose.model("Participant", participantSchema);

export default Participant;
