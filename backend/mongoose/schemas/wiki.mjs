import mongoose from "mongoose";

/**
 * Wiki Schema
 * Defines the structure for wiki pages in the database
 */
const wikiSchema = new mongoose.Schema({
  // Basic information
  title: {
    type: String,
    required: true,
    trim: true,
  },
  urlSlug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },

  // Info table data
  infoImage: {
    url: String,
    alt: String,
    publicId: String,
  },
  infoFields: [
    {
      label: String,
      value: String,
    },
  ],

  // Content
  content: {
    type: String,
    required: true,
  },
  contentImageIds: [
    {
      publicId: String,
    },
  ],

  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  author: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastModified: {
    type: Date,
    default: Date.now,
  },
});

// Create a text index for search functionality
wikiSchema.index({ title: "text", content: "text" });

// Pre-save hook to update lastModified date
wikiSchema.pre("save", function (next) {
  this.lastModified = new Date();
  next();
});

// Export the Wiki model with explicit collection name 'wikis'
export const Wiki = mongoose.model("Wiki", wikiSchema, "wikis");
