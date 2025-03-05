import express from "express";
import { Image } from "../mongoose/schemas/image.mjs";
import {
  cloudinaryConfig,
  uploader,
  multerUploads,
  dataUri,
} from "../middlewares.mjs";
const router = express.Router();

router.use("*", cloudinaryConfig);
// Multer storage configuration

router.post("/api/upload", multerUploads, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file provided" });
    }

    const fileContent = await dataUri(req);
    const result = await uploader.upload(fileContent, {
      resource_type: "auto",
      allowed_formats: ["jpg", "png", "webp"],
    });

    // Don't save the image in MongoDB, just save the URL
    const newImage = new Image({
      imageUrl: result.secure_url,
    });
    await newImage.save();

    return res.status(200).json({
      message: "Image uploaded successfully",
    });
  } catch (err) {
    console.error("Upload Error:", err);
    return res.status(500).json({
      message: "File processing failed",
      error: err.message,
    });
  }
});

export default router;
