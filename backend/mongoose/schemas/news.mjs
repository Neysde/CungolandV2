import mongoose from "mongoose";

/**
 * News Schema
 * Defines the structure for news articles in the database
 */
const newsSchema = new mongoose.Schema({
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

  // News-specific fields
  publishDate: {
    type: Date,
    default: Date.now,
  },
  category: {
    type: String,
    default: "General",
  },
  featured: {
    type: Boolean,
    default: false,
  },

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
newsSchema.index({ title: "text", content: "text", category: "text" });

// Pre-save hook to update lastModified date
newsSchema.pre("save", function (next) {
  this.lastModified = new Date();
  next();
});

// Export the News model with explicit collection name 'news'
export const News = mongoose.model("News", newsSchema, "news");
