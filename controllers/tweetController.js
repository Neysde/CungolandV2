/**
 * Tweet Controller
 * Handles all tweet-related operations including rendering, creating, updating, and deleting tweets
 */

const Tweet = require("../models/Tweet");
const cloudinary = require("../utils/cloudinary");
const { handleAsync } = require("../utils/errorHandlers");

/**
 * Render the ÇüngoTwitter page with all tweets
 */
exports.renderTwitterPage = handleAsync(async (req, res) => {
  // Get all tweets, sorted by creation date (newest first)
  const tweets = await Tweet.find().sort({ createdAt: -1 });

  // Format timestamps for display
  const formattedTweets = tweets.map((tweet) => {
    return {
      id: tweet._id,
      username: tweet.username,
      handle: tweet.handle,
      text: tweet.text,
      image: tweet.image?.url,
      likes: tweet.likes,
      retweets: tweet.retweets,
      comments: tweet.comments,
      timestamp: tweet.formatTimestamp(),
    };
  });

  // Render the page with tweets
  res.render("cungotwitter", {
    title: "ÇüngoTwitter",
    tweets: formattedTweets,
  });
});

/**
 * Render the dashboard with user's tweets
 */
exports.renderDashboard = handleAsync(async (req, res) => {
  // Get all tweets for the dashboard
  const tweets = await Tweet.find().sort({ createdAt: -1 });

  // Format tweets for display in the dashboard
  const userTweets = tweets.map((tweet) => {
    return {
      id: tweet._id,
      username: tweet.username,
      handle: tweet.handle,
      text: tweet.text,
      image: tweet.image?.url,
      timestamp: tweet.formatTimestamp(),
    };
  });

  // Render the dashboard with tweets
  res.render("dashboard", {
    title: "Dashboard",
    userTweets: userTweets,
    wikis: req.wikis || [], // Pass wikis if they exist in the request
  });
});

/**
 * Create a new tweet
 */
exports.createTweet = handleAsync(async (req, res) => {
  const { username, handle, text } = req.body;

  // Create tweet object
  const tweetData = {
    username,
    handle,
    text,
  };

  // Handle image upload if present
  if (req.file) {
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "cungotwitter",
      resource_type: "image",
    });

    // Add image data to tweet
    tweetData.image = {
      url: result.secure_url,
      publicId: result.public_id,
    };
  }

  // Save tweet to database
  const tweet = await Tweet.create(tweetData);

  // Redirect to dashboard
  res.redirect("/dashboard");
});

/**
 * Update an existing tweet
 */
exports.updateTweet = handleAsync(async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  // Find and update the tweet
  const tweet = await Tweet.findByIdAndUpdate(
    id,
    { text, updatedAt: Date.now() },
    { new: true, runValidators: true }
  );

  if (!tweet) {
    return res.status(404).json({ success: false, message: "Tweet not found" });
  }

  // Return success response
  res.status(200).json({ success: true, tweet });
});

/**
 * Delete a tweet
 */
exports.deleteTweet = handleAsync(async (req, res) => {
  const { id } = req.params;

  // Find the tweet
  const tweet = await Tweet.findById(id);

  if (!tweet) {
    return res.status(404).json({ success: false, message: "Tweet not found" });
  }

  // Delete image from Cloudinary if exists
  if (tweet.image && tweet.image.publicId) {
    await cloudinary.uploader.destroy(tweet.image.publicId);
  }

  // Delete the tweet
  await Tweet.findByIdAndDelete(id);

  // Return success response
  res
    .status(200)
    .json({ success: true, message: "Tweet deleted successfully" });
});

/**
 * Like a tweet
 */
exports.likeTweet = handleAsync(async (req, res) => {
  const { id } = req.params;

  // Find and update the tweet
  const tweet = await Tweet.findByIdAndUpdate(
    id,
    { $inc: { likes: 1 } },
    { new: true }
  );

  if (!tweet) {
    return res.status(404).json({ success: false, message: "Tweet not found" });
  }

  // Return success response
  res.status(200).json({ success: true, likes: tweet.likes });
});
