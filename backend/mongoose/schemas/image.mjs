import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  imageUrl: mongoose.Schema.Types.String,
});

export const Image = mongoose.model("Image", imageSchema);
