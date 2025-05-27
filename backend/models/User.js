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
    type: String,
  },
  userStravaFirstName: {
    type: String,
  },
  userStravaLastName: {
    type: String,
  },
  userStravaPic: {
    type: String,
  },
  userStravaRefresh: {
    type: String,
  },
  userTokenExpire: {
    type: Date,
  },
  isPremium: {
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

userSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const User = mongoose.model("User", userSchema);

export default User;
