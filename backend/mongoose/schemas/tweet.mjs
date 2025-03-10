/**
 * Tweet Schema
 * Defines the schema for tweets in the ÇüngoTwitter application
 */

import mongoose from "mongoose";

const tweetSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    trim: true,
  },
  handle: {
    type: String,
    required: [true, "Handle is required"],
    trim: true,
  },
  text: {
    type: String,
    required: [true, "Tweet text is required"],
    maxlength: [280, "Tweet cannot exceed 280 characters"],
  },
  image: {
    url: String,
    publicId: String,
  },
  likes: {
    type: Number,
    default: 0,
  },
  retweets: {
    type: Number,
    default: 0,
  },
  comments: {
    type: Number,
    default: 0,
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

// Update the updatedAt timestamp before saving
tweetSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Format timestamp for display
tweetSchema.methods.formatTimestamp = function () {
  const date = this.createdAt;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const Tweet = mongoose.model("Tweet", tweetSchema);
