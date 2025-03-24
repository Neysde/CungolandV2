import express from "express";
import { Photo } from "../mongoose/schemas/photo.mjs";
import {
  cloudinaryConfig,
  uploader,
  multerUploads,
  dataUri,
} from "../middlewares.mjs";
import cloudinary from "cloudinary";

const router = express.Router();

router.use("*", cloudinaryConfig);

/**
 * POST /api/photos
 * Upload a new photo with description
 */
router.post("/api/photos", multerUploads, async (req, res) => {
  try {
    // Check if files exist and if the image field exists
    if (!req.files || !req.files.image || !req.files.image.length) {
      return res.status(400).json({ message: "No file provided" });
    }

    if (!req.body.description) {
      return res.status(400).json({ message: "Description is required" });
    }

    // Get the uploaded file
    const uploadedFile = req.files.image[0];

    // Upload image to Cloudinary
    const fileContent = await dataUri(uploadedFile);
    const result = await uploader.upload(fileContent, {
      resource_type: "auto",
      allowed_formats: ["jpg", "png", "webp"],
    });

    // Get optimized URL
    const optimizeUrl = cloudinary.v2.url(result.public_id, {
      fetch_format: "auto",
      quality: "auto",
    });

    // Create new photo document
    const newPhoto = new Photo({
      publicId: result.public_id,
      imageUrl: optimizeUrl,
      description: req.body.description,
    });

    await newPhoto.save();

    return res.status(201).json({
      message: "Photo uploaded successfully",
      photo: newPhoto,
    });
  } catch (err) {
    console.error("Upload Error:", err);
    return res.status(500).json({
      message: "File processing failed",
      error: err.message,
    });
  }
});

/**
 * GET /api/photos
 * Get all photos
 */
router.get("/api/photos", async (req, res) => {
  try {
    // Get all photos, sorted by creation date (newest first)
    const photos = await Photo.find().sort({ createdAt: -1 });
    return res.status(200).json(photos);
  } catch (err) {
    console.error("Error fetching photos:", err);
    return res.status(500).json({
      message: "Failed to fetch photos",
      error: err.message,
    });
  }
});

/**
 * PUT /api/photos/:id
 * Update a photo's description
 */
router.put("/api/photos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ message: "Description is required" });
    }

    const updatedPhoto = await Photo.findByIdAndUpdate(
      id,
      { description },
      { new: true }
    );

    if (!updatedPhoto) {
      return res.status(404).json({ message: "Photo not found" });
    }

    return res.status(200).json({
      message: "Photo updated successfully",
      photo: updatedPhoto,
    });
  } catch (err) {
    console.error("Update Error:", err);
    return res.status(500).json({
      message: "Failed to update photo",
      error: err.message,
    });
  }
});

/**
 * DELETE /api/photos/:id
 * Delete a photo
 */
router.delete("/api/photos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const photo = await Photo.findById(id);

    if (!photo) {
      return res.status(404).json({ message: "Photo not found" });
    }

    // Extract public_id from Cloudinary URL to delete the image
    const publicId = photo.publicId;

    // Delete from Cloudinary
    await cloudinary.v2.uploader.destroy(publicId);

    // Delete from database
    await Photo.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Photo deleted successfully",
    });
  } catch (err) {
    console.error("Delete Error:", err);
    return res.status(500).json({
      message: "Failed to delete photo",
      error: err.message,
    });
  }
});

export default router;
