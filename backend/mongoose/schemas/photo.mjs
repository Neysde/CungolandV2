import mongoose from "mongoose";

/**
 * Schema for Çüngoland photos
 * Stores both the image URL and a description
 * Uses timestamps to track creation and update times
 */
const photoSchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true } // Add createdAt and updatedAt fields
);

export const Photo = mongoose.model("Photo", photoSchema);
