import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import {
  isAuthenticated,
  multerUploads,
  dataUri,
  uploader,
  cloudinaryConfig,
} from "../middlewares.mjs";
import cloudinary from "cloudinary";
import mongoose from "mongoose";
import { Tweet } from "../mongoose/schemas/tweet.mjs";

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Use cloudinary config middleware
router.use("*", cloudinaryConfig);

// Render ÇüngoTwitter page
router.get("/cungotwitter", async (req, res) => {
  try {
    // Fetch all tweets, sorted by creation date (newest first)
    const tweets = await Tweet.find().sort({ createdAt: -1 });

    // Format tweets for display
    const formattedTweets = tweets.map((tweet) => {
      return {
        id: tweet._id,
        username: tweet.username,
        handle: tweet.handle,
        text: tweet.text,
        image: tweet.image?.url,
        likes: tweet.likes || 0,
        retweets: tweet.retweets || 0,
        comments: tweet.comments || 0,
        timestamp: tweet.formatTimestamp(),
      };
    });

    // Render the page with tweets
    res.render("cungotwitter", {
      title: "ÇüngoTwitter",
      tweets: formattedTweets,
    });
  } catch (error) {
    console.error("Twitter Page Error:", error);
    res.render("cungotwitter", {
      title: "ÇüngoTwitter",
      tweets: [],
    });
  }
});

// Create a new tweet
router.post("/api/tweets", isAuthenticated, multerUploads, async (req, res) => {
  try {
    const { username, handle, text } = req.body;

    // Validate required fields
    if (!username || !handle || !text) {
      console.error("Missing required fields:", { username, handle, text });
      return res.status(400).json({
        success: false,
        message: "Username, handle, and text are required",
      });
    }

    // Create tweet object
    const tweetData = {
      username,
      handle,
      text,
    };

    // Handle image upload if present
    if (req.files && req.files.tweetImage && req.files.tweetImage.length > 0) {
      const fileContent = await dataUri(req.files.tweetImage[0]);
      const result = await uploader.upload(fileContent, {
        resource_type: "auto",
        allowed_formats: ["jpg", "png", "webp"],
        folder: "cungotwitter",
      });

      // Add image data to tweet
      tweetData.image = {
        url: cloudinary.v2.url(result.public_id, {
          fetch_format: "auto",
          quality: "auto",
        }),
        publicId: result.public_id,
      };
    }

    // Save tweet to database using the Tweet model
    const tweet = new Tweet(tweetData);
    const savedTweet = await tweet.save();

    // Redirect to dashboard
    res.redirect("/api/dashboard");
  } catch (error) {
    console.error("Tweet Creation Error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating tweet",
      error: error.message,
    });
  }
});

// Update an existing tweet
router.put("/api/tweets/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    // Find and update the tweet using the Tweet model
    const tweet = await Tweet.findByIdAndUpdate(
      id,
      { text, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!tweet) {
      return res.status(404).json({
        success: false,
        message: "Tweet not found",
      });
    }

    // Return success response
    res.status(200).json({
      success: true,
      message: "Tweet updated successfully",
    });
  } catch (error) {
    console.error("Tweet Update Error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating tweet",
      error: error.message,
    });
  }
});

// Delete a tweet
router.delete("/api/tweets/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    // Find the tweet using the Tweet model
    const tweet = await Tweet.findById(id);

    if (!tweet) {
      return res.status(404).json({
        success: false,
        message: "Tweet not found",
      });
    }

    // Delete image from Cloudinary if exists
    if (tweet.image && tweet.image.publicId) {
      await uploader.destroy(tweet.image.publicId);
    }

    // Delete the tweet
    await Tweet.findByIdAndDelete(id);

    // Return success response
    res.status(200).json({
      success: true,
      message: "Tweet deleted successfully",
    });
  } catch (error) {
    console.error("Tweet Deletion Error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting tweet",
      error: error.message,
    });
  }
});

// Like a tweet
router.post("/api/tweets/:id/like", async (req, res) => {
  try {
    const { id } = req.params;

    // Find and update the tweet using the Tweet model
    const tweet = await Tweet.findByIdAndUpdate(
      id,
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!tweet) {
      return res.status(404).json({
        success: false,
        message: "Tweet not found",
      });
    }

    // Return success response
    res.status(200).json({
      success: true,
      likes: tweet.likes,
    });
  } catch (error) {
    console.error("Tweet Like Error:", error);
    res.status(500).json({
      success: false,
      message: "Error liking tweet",
      error: error.message,
    });
  }
});

export default router;
