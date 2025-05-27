import mongoose from "mongoose";

const embeddedParticipantSegmentResultSchema = new mongoose.Schema(
  {
    segmentId: { type: Number, required: true },
    segmentName: String,
    elapsedTimeSeconds: Number,
  },
  { _id: false }
);
const participantSchema = new mongoose.Schema({
  race: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Race",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  submittedRide: {
    type: Boolean,
    default: false,
  },
  submittedActivityId: {
    type: Number,
  },
  segmentResults: [embeddedParticipantSegmentResultSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

participantSchema.index({ race: 1, user: 1 }, { unique: true });

participantSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Participant = mongoose.model("Participant", participantSchema);

export default Participant;
