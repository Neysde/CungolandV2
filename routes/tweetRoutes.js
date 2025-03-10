/**
 * Tweet Routes
 * Defines routes for the ÇüngoTwitter functionality
 */

const express = require("express");
const router = express.Router();
const multer = require("multer");
const tweetController = require("../controllers/tweetController");

// Set up multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Page routes
router.get("/cungotwitter", tweetController.renderTwitterPage);

// API routes
router.post("/api/tweets", upload.single("image"), tweetController.createTweet);
router.put("/api/tweets/:id", tweetController.updateTweet);
router.delete("/api/tweets/:id", tweetController.deleteTweet);
router.post("/api/tweets/:id/like", tweetController.likeTweet);

module.exports = router;
