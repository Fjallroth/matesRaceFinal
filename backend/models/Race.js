import mongoose from "mongoose";

const raceSchema = new mongoose.Schema({
  raceName: {
    type: String,
    required: [true, "Race name is required"],
    trim: true,
  },
  raceInfo: {
    type: String,
    trim: true,
  },
  startDate: {
    type: Date,
    required: [true, "Start date is required"],
  },
  endDate: {
    type: Date,
    required: [true, "End date is required"],
    validate: [
      function (value) {
        return this.startDate < value;
      },
      "End date must be after start date",
    ],
  },
  segmentIds: [
    {
      type: Number,
      required: true,
    },
  ],
  organiser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  password: {
    type: String,
    required: function () {
      return this.isPrivate;
    },
    minlength: [4, "Password must be at least 4 characters"],
  },
  isPrivate: {
    type: Boolean,
    default: true,
  },
  hideLeaderboardUntilFinish: {
    type: Boolean,
    default: false,
  },
  useSexCategories: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

raceSchema.pre("save", async function (next) {
  this.updatedAt = Date.now();
  if (this.isModified("password") && this.password) {
  }
  next();
});

raceSchema.virtual("participantCount", {
  ref: "Participant",
  localField: "_id",
  foreignField: "race",
  count: true,
});

raceSchema.set("toJSON", { virtuals: true });
raceSchema.set("toObject", { virtuals: true });

const Race = mongoose.model("Race", raceSchema);

export default Race;
