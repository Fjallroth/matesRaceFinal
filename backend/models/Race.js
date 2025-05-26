// /models/Race.js
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
        // `this` refers to the document being validated
        return this.startDate < value;
      },
      "End date must be after start date",
    ],
  },
  segmentIds: [
    {
      // Array of Strava Segment IDs
      type: Number,
      required: true,
    },
  ],
  organiser: {
    // Mongoose ObjectId referencing the User who organized the race
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  password: {
    // Hashed password for private races
    type: String,
    required: function () {
      return this.isPrivate;
    }, // Required if isPrivate is true
    minlength: [4, "Password must be at least 4 characters"],
  },
  isPrivate: {
    type: Boolean,
    default: true, // Default to private
  },
  hideLeaderboardUntilFinish: {
    type: Boolean,
    default: false,
  },
  useSexCategories: {
    // New field for sex-based categories
    type: Boolean,
    default: false,
  },
  // Participants are handled in a separate collection and referenced if needed,
  // or embedded if the list is not expected to grow excessively.
  // For simplicity and to mirror Spring's separate Participant entity, we'll keep it separate.
  // We can add a virtual for participantCount if needed.
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
  // Hash password if it's modified (and present)
  if (this.isModified("password") && this.password) {
    // In a real app, you'd salt and hash the password
    // For simplicity here, as Spring Security handles it, we'll store as is or use a simple hash if required.
    // Strava OAuth means users don't log in with this password; it's for race access.
    // If you need to hash, use bcryptjs:
    // const salt = await bcrypt.genSalt(10);
    // this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Virtual for participant count (can be implemented by querying Participants collection)
raceSchema.virtual("participantCount", {
  ref: "Participant",
  localField: "_id",
  foreignField: "race",
  count: true,
});

// Ensure virtuals are included in toJSON and toObject outputs
raceSchema.set("toJSON", { virtuals: true });
raceSchema.set("toObject", { virtuals: true });

const Race = mongoose.model("Race", raceSchema);

export default Race;
