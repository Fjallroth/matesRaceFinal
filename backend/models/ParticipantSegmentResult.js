import mongoose from "mongoose";

const participantSegmentResultSchema = new mongoose.Schema({
  participant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Participant",
    required: true,
  },
  segmentId: {
    type: Number,
    required: true,
  },
  segmentName: {
    type: String,
  },
  elapsedTimeSeconds: {
    type: Number,
  },
});

const ParticipantSegmentResult = mongoose.model(
  "ParticipantSegmentResult",
  participantSegmentResultSchema
);
export default ParticipantSegmentResult;
