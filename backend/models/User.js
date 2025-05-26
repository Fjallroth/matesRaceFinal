// /models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  stravaId: {
    type: Number,
    required: true,
    unique: true,
    index: true,
  },
  displayName: {
    type: String,
  },
  userSex: {
    // M or F typically from Strava
    type: String,
  },
  userCity: {
    type: String,
  },
  userState: {
    type: String,
  },
  userCountry: {
    type: String,
  },
  userStravaAccess: {
    // Access Token
    type: String,
  },
  userStravaFirstName: {
    type: String,
  },
  userStravaLastName: {
    type: String,
  },
  userStravaPic: {
    // URL to profile picture
    type: String,
  },
  userStravaRefresh: {
    // Refresh Token
    type: String,
  },
  userTokenExpire: {
    // When the access token expires
    type: Date,
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

userSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const User = mongoose.model("User", userSchema);

export default User;
