import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import expressLayouts from "express-ejs-layouts";
import {
  isAuthenticated,
  multerUploads,
  dataUri,
  uploader,
  cloudinaryConfig,
} from "../middlewares.mjs";
import cloudinary from "cloudinary";
import { Wiki } from "../mongoose/schemas/wiki.mjs";
import { News } from "../mongoose/schemas/news.mjs";
import { Tweet } from "../mongoose/schemas/tweet.mjs";
import { Photo } from "../mongoose/schemas/photo.mjs";
import mongoose from "mongoose";

const router = express.Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

router.use(expressLayouts);
router.use("/css", express.static(path.join(__dirname, "../../views/css")));
router.use("/js", express.static(path.join(__dirname, "../../views/js")));

router.use("*", cloudinaryConfig);

router.get("/api/login", (req, res) => {
  res.render("login.ejs", { title: "Login | Cungoland", layout: false });
});

// Use the middleware to protect the dashboard route
router.get("/api/dashboard", isAuthenticated, async (req, res) => {
  try {
    // Get direct access to the 'wikis' collection
    const db = mongoose.connection.db;
    const wikisCollection = db.collection("wikis");

    // Fetch all wikis from the collection
    const wikis = await wikisCollection
      .find()
      .sort({ lastModified: -1 })
      .toArray();

    // Fetch all tweets using the Tweet model
    const tweets = await Tweet.find().sort({ createdAt: -1 });

    // Fetch all photos using the Photo model
    const photos = await Photo.find().sort({ createdAt: -1 });

    // Fetch all news articles using the News model
    const newsArticles = await News.find().sort({ publishDate: -1 });

    // Format tweets for display
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

    // Get unique news categories
    const categories = [
      ...new Set(newsArticles.map((article) => article.category)),
    ];

    res.render("dashboard.ejs", {
      title: "Dashboard | Cungoland",
      wikis: wikis,
      userTweets: userTweets,
      photos: photos,
      newsArticles: newsArticles,
      newsCategories: categories,
      layout: false,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.render("dashboard.ejs", {
      title: "Dashboard | Cungoland",
      wikis: [],
      userTweets: [],
      photos: [],
      newsArticles: [],
      newsCategories: [],
    });
  }
});

// Wiki page by slug
router.get("/wiki/:slug", async (req, res) => {
  try {
    // Get direct access to the 'wikis' collection
    const db = mongoose.connection.db;
    const wikisCollection = db.collection("wikis");

    // Find wiki by slug
    const wiki = await wikisCollection.findOne({ urlSlug: req.params.slug });

    if (!wiki) {
      return res.status(404).render("error.ejs", {
        message: "Wiki page not found",
        error: { status: 404, stack: "" },
        layout: false,
      });
    }

    // Render wiki page
    res.render("wiki.ejs", {
      title: wiki.title,
      imageUrl: wiki.infoImage?.url || "",
      imageAlt: wiki.infoImage?.alt || wiki.title,
      additionalInfo: wiki.infoFields || [],
      content: wiki.content,
      lastModified: new Date(wiki.lastModified).toLocaleDateString(),
    });
  } catch (error) {
    console.error("Wiki Fetch Error:", error);
    res.status(500).render("error.ejs", {
      message: "Error fetching wiki page",
      error: {
        status: 500,
        stack: process.env.NODE_ENV === "development" ? error.stack : "",
      },
      layout: false,
    });
  }
});

// Get wiki data for editing
router.get("/api/wiki/:id/data", isAuthenticated, async (req, res) => {
  try {
    // Validate the ID format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid wiki ID format",
      });
    }

    // Get direct access to the 'wikis' collection
    const db = mongoose.connection.db;
    const wikisCollection = db.collection("wikis");

    // Find wiki by ID using the native MongoDB driver
    const objectId = new mongoose.Types.ObjectId(req.params.id);
    const wiki = await wikisCollection.findOne({ _id: objectId });

    if (!wiki) {
      return res.status(404).json({
        success: false,
        message: "Wiki not found",
      });
    }

    // Return wiki data
    res.status(200).json(wiki);
  } catch (error) {
    console.error("Wiki Data Fetch Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching wiki data",
      error: error.message,
    });
  }
});

// Update wiki
router.post(
  "/api/wiki/:id/update",
  isAuthenticated,
  multerUploads,
  async (req, res) => {
    try {
      // Validate the ID format
      if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          success: false,
          message: "Invalid wiki ID format",
        });
      }

      // Get direct access to the 'wikis' collection
      const db = mongoose.connection.db;
      const wikisCollection = db.collection("wikis");

      // Find wiki by ID
      const objectId = new mongoose.Types.ObjectId(req.params.id);
      const wiki = await wikisCollection.findOne({ _id: objectId });

      if (!wiki) {
        return res.status(404).json({
          success: false,
          message: "Wiki not found",
        });
      }

      // Extract form data
      const {
        title,
        urlSlug,
        infoLabels,
        infoValues,
        subtitles,
        paragraphs,
        imageCaptions,
      } = req.body;

      // If urlSlug is empty, generate it from title
      const finalUrlSlug =
        urlSlug ||
        title
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-");

      // Check if wiki with this slug already exists (excluding current wiki)
      const existingWiki = await wikisCollection.findOne({
        urlSlug: finalUrlSlug,
        _id: { $ne: objectId },
      });

      if (existingWiki) {
        return res.status(400).json({
          success: false,
          message: "A wiki with this URL already exists",
        });
      }

      // Process info table image
      let infoImageUrl = wiki.infoImage?.url || "";
      let infoImageAlt = title;
      let infoImagePublicId = wiki.infoImage?.publicId || "";

      if (req.files && req.files.infoImage && req.files.infoImage.length > 0) {
        const fileContent = await dataUri(req.files.infoImage[0]);
        const result = await uploader.upload(fileContent, {
          resource_type: "auto",
          allowed_formats: ["jpg", "png", "webp"],
        });

        infoImagePublicId = result.public_id;

        infoImageUrl = cloudinary.v2.url(result.public_id, {
          fetch_format: "auto",
          quality: "auto",
        });
      }

      // Process content images - check both field name formats
      const contentImageUrls = [];
      const contentImagePublicIds = [];
      // Check for contentImages[] field
      if (
        req.files &&
        req.files["contentImages[]"] &&
        req.files["contentImages[]"].length > 0
      ) {
        for (const file of req.files["contentImages[]"]) {
          const fileContent = await dataUri(file);
          const result = await uploader.upload(fileContent, {
            resource_type: "auto",
            allowed_formats: ["jpg", "png", "webp"],
          });

          contentImagePublicIds.push({ publicId: result.public_id });

          const imageUrl = cloudinary.v2.url(result.public_id, {
            fetch_format: "auto",
            quality: "auto",
          });

          contentImageUrls.push(imageUrl);
        }
      }
      // Also check for contentImages field (without array notation)
      else if (
        req.files &&
        req.files.contentImages &&
        req.files.contentImages.length > 0
      ) {
        for (const file of req.files.contentImages) {
          const fileContent = await dataUri(file);
          const result = await uploader.upload(fileContent, {
            resource_type: "auto",
            allowed_formats: ["jpg", "png", "webp"],
          });

          const imageUrl = cloudinary.v2.url(result.public_id, {
            fetch_format: "auto",
            quality: "auto",
          });

          contentImageUrls.push(imageUrl);
        }
      }

      // Create info fields array
      const infoFields = [];
      if (infoLabels && infoValues) {
        // If infoLabels is a string, convert to array
        const labelsArray = Array.isArray(infoLabels)
          ? infoLabels
          : [infoLabels];
        const valuesArray = Array.isArray(infoValues)
          ? infoValues
          : [infoValues];

        for (let i = 0; i < labelsArray.length; i++) {
          if (labelsArray[i] && valuesArray[i]) {
            infoFields.push({
              label: labelsArray[i],
              value: valuesArray[i],
            });
          }
        }
      }

      // Generate HTML content from paragraphs, subtitles, and images
      let htmlContent = "";

      // If subtitles is a string, convert to array
      const subtitlesArray = Array.isArray(subtitles)
        ? subtitles
        : subtitles
        ? [subtitles]
        : [];
      const paragraphsArray = Array.isArray(paragraphs)
        ? paragraphs
        : paragraphs
        ? [paragraphs]
        : [];
      const imageCaptionsArray = Array.isArray(imageCaptions)
        ? imageCaptions
        : imageCaptions
        ? [imageCaptions]
        : [];

      // Add paragraphs and subtitles
      for (let i = 0; i < paragraphsArray.length; i++) {
        if (subtitlesArray[i]) {
          htmlContent += `<h2>${subtitlesArray[i]}</h2>`;
        }

        if (paragraphsArray[i]) {
          htmlContent += `<p>${paragraphsArray[i]}</p>`;
        }
      }

      // Add images with captions
      for (let i = 0; i < contentImageUrls.length; i++) {
        const caption = imageCaptionsArray[i] || "";
        htmlContent += `
        <div class="article-image">
          <img src="${contentImageUrls[i]}" alt="${caption}">
          ${caption ? `<p class="image-caption">${caption}</p>` : ""}
        </div>
      `;
      }

      // Update wiki document using the collection
      await wikisCollection.updateOne(
        { _id: objectId },
        {
          $set: {
            title,
            urlSlug: finalUrlSlug,
            infoImage: {
              url: infoImageUrl,
              alt: infoImageAlt,
              publicId: infoImagePublicId,
            },
            infoFields,
            content: htmlContent,
            contentImageIds: contentImagePublicIds,
            lastModified: new Date(),
          },
        }
      );

      // Return success with the URL
      res.status(200).json({
        success: true,
        message: "Wiki updated successfully",
        url: `/api/wiki/${finalUrlSlug}`,
      });
    } catch (error) {
      console.error("Wiki Update Error:", error);
      res.status(500).json({
        success: false,
        message: "Error updating wiki",
        error: error.message,
      });
    }
  }
);

// Delete wiki
router.post("/api/wiki/:id/delete", isAuthenticated, async (req, res) => {
  try {
    // Validate the ID format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid wiki ID format",
      });
    }

    // Get direct access to the 'wikis' collection
    const db = mongoose.connection.db;
    const wikisCollection = db.collection("wikis");
    const objectId = new mongoose.Types.ObjectId(req.params.id);
    const wiki = await wikisCollection.findOne({ _id: objectId });

    const publicId = wiki.infoImage.publicId;
    const contentImagePublicIds = wiki.contentImageIds.map((id) => id.publicId);
    contentImagePublicIds.forEach((id) => {
      cloudinary.v2.uploader.destroy(id);
    });

    cloudinary.v2.uploader.destroy(publicId);

    // Delete wiki by ID

    const deleteResult = await wikisCollection.deleteOne({ _id: objectId });

    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Wiki not found",
      });
    }

    // Return success
    res.status(200).json({
      success: true,
      message: "Wiki deleted successfully",
    });
  } catch (error) {
    console.error("Wiki Delete Error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting wiki",
      error: error.message,
    });
  }
});

// Handle wiki creation
router.post(
  "/api/wiki/create",
  isAuthenticated,
  multerUploads,
  async (req, res) => {
    try {
      // Extract form data
      const {
        title,
        urlSlug,
        infoLabels,
        infoValues,
        subtitles,
        paragraphs,
        imageCaptions,
      } = req.body;

      // If urlSlug is empty, generate it from title
      const finalUrlSlug =
        urlSlug ||
        title
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-");

      // Get direct access to the 'wikis' collection
      const db = mongoose.connection.db;
      const wikisCollection = db.collection("wikis");

      // Check if wiki with this slug already exists
      const existingWiki = await wikisCollection.findOne({
        urlSlug: finalUrlSlug,
      });
      if (existingWiki) {
        return res.status(400).json({
          success: false,
          message: "A wiki with this URL already exists",
        });
      }

      // Process info table image
      let infoImageUrl = "";
      let infoImageAlt = title;
      let infoImagePublicId = "";
      if (req.files && req.files.infoImage && req.files.infoImage.length > 0) {
        const fileContent = await dataUri(req.files.infoImage[0]);
        const result = await uploader.upload(fileContent, {
          resource_type: "auto",
          allowed_formats: ["jpg", "png", "webp"],
        });

        infoImagePublicId = result.public_id;

        infoImageUrl = cloudinary.v2.url(result.public_id, {
          fetch_format: "auto",
          quality: "auto",
        });
      }

      // Process content images - check both field name formats
      const contentImageUrls = [];
      const contentImagePublicIds = [];
      // Check for contentImages[] field
      if (
        req.files &&
        req.files["contentImages[]"] &&
        req.files["contentImages[]"].length > 0
      ) {
        for (const file of req.files["contentImages[]"]) {
          const fileContent = await dataUri(file);
          const result = await uploader.upload(fileContent, {
            resource_type: "auto",
            allowed_formats: ["jpg", "png", "webp"],
          });

          contentImagePublicIds.push({ publicId: result.public_id });

          const imageUrl = cloudinary.v2.url(result.public_id, {
            fetch_format: "auto",
            quality: "auto",
          });

          contentImageUrls.push(imageUrl);
        }
      }
      // Also check for contentImages field (without array notation)
      else if (
        req.files &&
        req.files.contentImages &&
        req.files.contentImages.length > 0
      ) {
        for (const file of req.files.contentImages) {
          const fileContent = await dataUri(file);
          const result = await uploader.upload(fileContent, {
            resource_type: "auto",
            allowed_formats: ["jpg", "png", "webp"],
          });

          const imageUrl = cloudinary.v2.url(result.public_id, {
            fetch_format: "auto",
            quality: "auto",
          });

          contentImageUrls.push(imageUrl);
        }
      }

      // Create info fields array
      const infoFields = [];
      if (infoLabels && infoValues) {
        // If infoLabels is a string, convert to array
        const labelsArray = Array.isArray(infoLabels)
          ? infoLabels
          : [infoLabels];
        const valuesArray = Array.isArray(infoValues)
          ? infoValues
          : [infoValues];

        for (let i = 0; i < labelsArray.length; i++) {
          if (labelsArray[i] && valuesArray[i]) {
            infoFields.push({
              label: labelsArray[i],
              value: valuesArray[i],
            });
          }
        }
      }

      // Generate HTML content from paragraphs, subtitles, and images
      let htmlContent = "";

      // If subtitles is a string, convert to array
      const subtitlesArray = Array.isArray(subtitles)
        ? subtitles
        : subtitles
        ? [subtitles]
        : [];
      const paragraphsArray = Array.isArray(paragraphs)
        ? paragraphs
        : paragraphs
        ? [paragraphs]
        : [];
      const imageCaptionsArray = Array.isArray(imageCaptions)
        ? imageCaptions
        : imageCaptions
        ? [imageCaptions]
        : [];

      // Add paragraphs and subtitles
      for (let i = 0; i < paragraphsArray.length; i++) {
        if (subtitlesArray[i]) {
          htmlContent += `<h2>${subtitlesArray[i]}</h2>`;
        }

        if (paragraphsArray[i]) {
          htmlContent += `<p>${paragraphsArray[i]}</p>`;
        }
      }

      // Add images with captions
      for (let i = 0; i < contentImageUrls.length; i++) {
        const caption = imageCaptionsArray[i] || "";
        htmlContent += `
        <div class="article-image">
          <img src="${contentImageUrls[i]}" alt="${caption}">
          ${caption ? `<p class="image-caption">${caption}</p>` : ""}
        </div>
      `;
      }

      // Create new wiki document
      const newWiki = {
        title,
        urlSlug: finalUrlSlug,
        infoImage: {
          url: infoImageUrl,
          alt: infoImageAlt,
          publicId: infoImagePublicId,
        },
        infoFields,
        content: htmlContent,
        contentImageIds: contentImagePublicIds,
        createdBy: req.session?.userId, //req.user?._id, // If user authentication is implemented
        author: req.session?.username,
        createdAt: new Date(),
        lastModified: new Date(),
      };

      // Insert wiki into collection
      await wikisCollection.insertOne(newWiki);

      // Return success with the URL
      res.status(200).json({
        success: true,
        message: "Wiki created successfully",
        url: `/api/wiki/${finalUrlSlug}`,
      });
    } catch (error) {
      console.error("Wiki Creation Error:", error);
      res.status(500).json({
        success: false,
        message: "Error creating wiki",
        error: error.message,
      });
    }
  }
);

// Main Page route
router.get("/", async (req, res) => {
  try {
    // Get random photos for carousel (limit to 5)
    const allPhotos = await Photo.find();
    const randomPhotos = getRandomItems(allPhotos, 5);

    // Get random wiki entries (limit to 3)
    const db = mongoose.connection.db;
    const wikisCollection = db.collection("wikis");
    const allWikis = await wikisCollection.find().toArray();
    const randomWikis = getRandomItems(allWikis, 3);

    // Get all featured news articles sorted by publish date (newest first)
    const newsArticles = await News.find({ featured: true }).sort({
      publishDate: -1,
    });

    res.render("index.ejs", {
      title: "Çüngoland - Ana Sayfa",
      photos: randomPhotos,
      wikis: randomWikis,
      newsArticles: newsArticles,
      user: req.session?.user || null,
    });
  } catch (error) {
    console.error("Main Page Error:", error);
    res.status(500).render("index.ejs", {
      title: "Çüngoland - Ana Sayfa",
      photos: [],
      wikis: [],
      newsArticles: [],
      user: req.session?.user || null,
    });
  }
});

// Helper function to get random items from an array
function getRandomItems(array, count) {
  // If array is smaller than requested count, return the whole array
  if (!array || array.length <= count) {
    return array || [];
  }

  // Create a copy of the array to avoid modifying the original
  const shuffled = [...array];

  // Fisher-Yates shuffle algorithm
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Return the first 'count' items
  return shuffled.slice(0, count);
}

// Route for the photos page with a more user-friendly URL
router.get("/photos-from-cungoland", async (req, res) => {
  try {
    // Fetch all photos, sorted by creation date (newest first)
    const photos = await Photo.find().sort({ createdAt: -1 });

    res.render("cungoland-photos.ejs", {
      title: "Photos From Çüngoland",
      photos,
      layout: true,
    });
  } catch (err) {
    console.error("Error fetching photos:", err);
    res.status(500).render("error.ejs", {
      message: "Failed to load photos",
      error: err,
      layout: false,
    });
  }
});

// ÇüngoWiki page - displays all wikis
router.get("/cungowiki", async (req, res) => {
  try {
    // Get direct access to the 'wikis' collection
    const db = mongoose.connection.db;
    const wikisCollection = db.collection("wikis");

    // Fetch all wikis from the collection, sorted by last modified date
    const wikis = await wikisCollection
      .find()
      .sort({ lastModified: -1 })
      .toArray();

    // Render the ÇüngoWiki page with the wikis
    res.render("cungowiki.ejs", {
      wikis: wikis,
      user: req.session.user || null,
    });
  } catch (error) {
    console.error("ÇüngoWiki Error:", error);
    res.render("cungowiki.ejs", {
      wikis: [],
      user: req.session.user || null,
    });
  }
});

// ÇüngoNews page
router.get("/cungonews", async (req, res) => {
  try {
    // Fetch all news articles
    const newsArticles = await News.find().sort({ publishDate: -1 });

    // Get unique categories
    const categories = [
      ...new Set(newsArticles.map((article) => article.category)),
    ];

    res.render("cungonews.ejs", {
      title: "ÇüngoNews | Cungoland",
      newsArticles: newsArticles,
      categories: categories,
    });
  } catch (error) {
    console.error("ÇüngoNews Error:", error);
    res.render("cungonews.ejs", {
      title: "ÇüngoNews | Cungoland",
      newsArticles: [],
      categories: [],
    });
  }
});

// News article by slug
router.get("/news/:slug", async (req, res) => {
  try {
    // Find news article by slug
    const newsArticle = await News.findOne({ urlSlug: req.params.slug });

    if (!newsArticle) {
      return res.status(404).render("error.ejs", {
        message: "News article not found",
        error: { status: 404, stack: "" },
        layout: false,
      });
    }

    // Render news article page
    res.render("news.ejs", {
      title: newsArticle.title,
      imageUrl: newsArticle.infoImage?.url || "",
      imageAlt: newsArticle.infoImage?.alt || newsArticle.title,
      additionalInfo: newsArticle.infoFields || [],
      content: newsArticle.content,
      publishDate: newsArticle.publishDate,
      category: newsArticle.category,
      featured: newsArticle.featured,
      author: newsArticle.author,
      lastModified: new Date(newsArticle.lastModified).toLocaleDateString(),
    });
  } catch (error) {
    console.error("News Article Fetch Error:", error);
    res.status(500).render("error.ejs", {
      message: "Error fetching news article",
      error: {
        status: 500,
        stack: process.env.NODE_ENV === "development" ? error.stack : "",
      },
      layout: false,
    });
  }
});

// Get news article data for editing
router.get("/api/news/:id/data", isAuthenticated, async (req, res) => {
  try {
    // Validate the ID format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid news article ID format",
      });
    }

    // Find news article by ID
    const newsArticle = await News.findById(req.params.id);

    if (!newsArticle) {
      return res.status(404).json({
        success: false,
        message: "News article not found",
      });
    }

    // Return news article data
    res.status(200).json(newsArticle);
  } catch (error) {
    console.error("News Article Data Fetch Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching news article data",
      error: error.message,
    });
  }
});

// Update news article
router.post(
  "/api/news/:id/update",
  isAuthenticated,
  multerUploads,
  async (req, res) => {
    try {
      // Validate the ID format
      if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          success: false,
          message: "Invalid news article ID format",
        });
      }

      // Find news article by ID
      const newsArticle = await News.findById(req.params.id);

      if (!newsArticle) {
        return res.status(404).json({
          success: false,
          message: "News article not found",
        });
      }

      // Extract form data
      const {
        title,
        urlSlug,
        infoLabels,
        infoValues,
        subtitles,
        paragraphs,
        imageCaptions,
        sectionTypes, // Add new field to track section types
        sectionOrder, // Add new field to track section order
        category,
        featured,
        publishDate,
      } = req.body;

      // If urlSlug is empty, generate it from title
      const finalUrlSlug =
        urlSlug ||
        title
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-");

      // Check if another news article with this slug already exists (excluding this one)
      const existingNewsArticle = await News.findOne({
        urlSlug: finalUrlSlug,
        _id: { $ne: req.params.id },
      });

      if (existingNewsArticle) {
        return res.status(400).json({
          success: false,
          message: "A news article with this URL already exists",
        });
      }

      // Process info table image
      let infoImageUrl = newsArticle.infoImage?.url || "";
      let infoImageAlt = title;
      let infoImagePublicId = newsArticle.infoImage?.publicId || "";

      if (req.files && req.files.infoImage && req.files.infoImage.length > 0) {
        const fileContent = await dataUri(req.files.infoImage[0]);
        const result = await uploader.upload(fileContent, {
          resource_type: "auto",
          allowed_formats: ["jpg", "png", "webp"],
        });

        // Store the new publicId
        infoImagePublicId = result.public_id;

        infoImageUrl = cloudinary.v2.url(result.public_id, {
          fetch_format: "auto",
          quality: "auto",
        });
      }

      // Process content images
      const contentImageUrls = [];
      const contentImagePublicIds = [];

      if (
        req.files &&
        req.files["contentImages[]"] &&
        req.files["contentImages[]"].length > 0
      ) {
        for (const file of req.files["contentImages[]"]) {
          const fileContent = await dataUri(file);
          const result = await uploader.upload(fileContent, {
            resource_type: "auto",
            allowed_formats: ["jpg", "png", "webp"],
          });

          // Store the publicId
          contentImagePublicIds.push({ publicId: result.public_id });

          const imageUrl = cloudinary.v2.url(result.public_id, {
            fetch_format: "auto",
            quality: "auto",
          });

          contentImageUrls.push(imageUrl);
        }
      } else if (
        req.files &&
        req.files.contentImages &&
        req.files.contentImages.length > 0
      ) {
        for (const file of req.files.contentImages) {
          const fileContent = await dataUri(file);
          const result = await uploader.upload(fileContent, {
            resource_type: "auto",
            allowed_formats: ["jpg", "png", "webp"],
          });

          contentImagePublicIds.push({ publicId: result.public_id });

          const imageUrl = cloudinary.v2.url(result.public_id, {
            fetch_format: "auto",
            quality: "auto",
          });

          contentImageUrls.push(imageUrl);
        }
      }

      // Create info fields array
      const infoFields = [];
      if (infoLabels && infoValues) {
        // If infoLabels is a string, convert to array
        const labelsArray = Array.isArray(infoLabels)
          ? infoLabels
          : [infoLabels];
        const valuesArray = Array.isArray(infoValues)
          ? infoValues
          : [infoValues];

        for (let i = 0; i < labelsArray.length; i++) {
          if (labelsArray[i] && valuesArray[i]) {
            infoFields.push({
              label: labelsArray[i],
              value: valuesArray[i],
            });
          }
        }
      }

      // Generate HTML content preserving the order of paragraphs and images
      let htmlContent = "";

      // Convert input arrays to ensure they're arrays even if single items
      const subtitlesArray = Array.isArray(subtitles)
        ? subtitles
        : subtitles
        ? [subtitles]
        : [];
      const paragraphsArray = Array.isArray(paragraphs)
        ? paragraphs
        : paragraphs
        ? [paragraphs]
        : [];
      const imageCaptionsArray = Array.isArray(imageCaptions)
        ? imageCaptions
        : imageCaptions
        ? [imageCaptions]
        : [];

      // Track paragraph and image counters
      let paragraphCounter = 0;
      let imageCounter = 0;

      // If sectionOrder is provided (from the form), use it to determine content order
      if (sectionOrder && sectionTypes) {
        const orderArray = Array.isArray(sectionOrder)
          ? sectionOrder
          : [sectionOrder];
        const typesArray = Array.isArray(sectionTypes)
          ? sectionTypes
          : [sectionTypes];

        // Process sections in the order provided
        for (let i = 0; i < orderArray.length; i++) {
          const index = parseInt(orderArray[i], 10);
          const type = typesArray[i];

          if (type === "paragraph") {
            // Add paragraph with subtitle if available
            if (paragraphCounter < paragraphsArray.length) {
              const subtitle = subtitlesArray[paragraphCounter] || "";
              const paragraph = paragraphsArray[paragraphCounter] || "";

              if (subtitle) {
                htmlContent += `<h2>${subtitle}</h2>`;
              }

              if (paragraph) {
                htmlContent += `<p>${paragraph}</p>`;
              }

              paragraphCounter++;
            }
          } else if (type === "image") {
            // Add image with caption if available
            if (imageCounter < contentImageUrls.length) {
              const caption = imageCaptionsArray[imageCounter] || "";

              htmlContent += `
              <div class="article-image">
                <img src="${contentImageUrls[imageCounter]}" alt="${caption}">
                ${caption ? `<p class="image-caption">${caption}</p>` : ""}
              </div>
              `;

              imageCounter++;
            }
          }
        }
      } else {
        // Fallback to the old method if no ordering data is provided
        // Add paragraphs and subtitles
        for (let i = 0; i < paragraphsArray.length; i++) {
          if (subtitlesArray[i]) {
            htmlContent += `<h2>${subtitlesArray[i]}</h2>`;
          }

          if (paragraphsArray[i]) {
            htmlContent += `<p>${paragraphsArray[i]}</p>`;
          }
        }

        // Add images with captions
        for (let i = 0; i < contentImageUrls.length; i++) {
          const caption = imageCaptionsArray[i] || "";
          htmlContent += `
          <div class="article-image">
            <img src="${contentImageUrls[i]}" alt="${caption}">
            ${caption ? `<p class="image-caption">${caption}</p>` : ""}
          </div>
          `;
        }
      }

      // Update news article
      newsArticle.title = title;
      newsArticle.urlSlug = finalUrlSlug;
      newsArticle.infoImage = {
        url: infoImageUrl,
        alt: infoImageAlt,
        publicId: infoImagePublicId,
      };
      newsArticle.infoFields = infoFields;
      newsArticle.content = htmlContent;
      newsArticle.category = category || "General";
      newsArticle.featured = featured === "true" || featured === true;
      newsArticle.publishDate = publishDate
        ? new Date(publishDate)
        : new Date();
      newsArticle.lastModified = new Date();

      // Only add new contentImageIds if we have uploaded new images
      if (contentImagePublicIds.length > 0) {
        newsArticle.contentImageIds = contentImagePublicIds;
      }

      // Save updated news article
      await newsArticle.save();

      // Return success with the URL
      res.status(200).json({
        success: true,
        message: "News article updated successfully",
        url: `/news/${finalUrlSlug}`,
      });
    } catch (error) {
      console.error("News Article Update Error:", error);
      res.status(500).json({
        success: false,
        message: "Error updating news article",
        error: error.message,
      });
    }
  }
);

// Handle news article creation
router.post(
  "/api/news/create",
  isAuthenticated,
  multerUploads,
  async (req, res) => {
    try {
      // Extract form data
      const {
        title,
        urlSlug,
        infoLabels,
        infoValues,
        subtitles,
        paragraphs,
        imageCaptions,
        sectionTypes, // Add new field to track section types
        sectionOrder, // Add new field to track section order
        category,
        featured,
        publishDate,
      } = req.body;

      // If urlSlug is empty, generate it from title
      const finalUrlSlug =
        urlSlug ||
        title
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-");

      // Check if news article with this slug already exists
      const existingNewsArticle = await News.findOne({
        urlSlug: finalUrlSlug,
      });

      if (existingNewsArticle) {
        return res.status(400).json({
          success: false,
          message: "A news article with this URL already exists",
        });
      }

      // Process info table image
      let infoImageUrl = "";
      let infoImageAlt = title;
      let infoImagePublicId = "";

      if (req.files && req.files.infoImage && req.files.infoImage.length > 0) {
        const fileContent = await dataUri(req.files.infoImage[0]);
        const result = await uploader.upload(fileContent, {
          resource_type: "auto",
          allowed_formats: ["jpg", "png", "webp"],
        });

        infoImagePublicId = result.public_id;

        infoImageUrl = cloudinary.v2.url(result.public_id, {
          fetch_format: "auto",
          quality: "auto",
        });
      }

      // Process content images
      const contentImageUrls = [];
      const contentImagePublicIds = [];

      if (
        req.files &&
        req.files["contentImages[]"] &&
        req.files["contentImages[]"].length > 0
      ) {
        for (const file of req.files["contentImages[]"]) {
          const fileContent = await dataUri(file);
          const result = await uploader.upload(fileContent, {
            resource_type: "auto",
            allowed_formats: ["jpg", "png", "webp"],
          });

          contentImagePublicIds.push({ publicId: result.public_id });

          const imageUrl = cloudinary.v2.url(result.public_id, {
            fetch_format: "auto",
            quality: "auto",
          });

          contentImageUrls.push(imageUrl);
        }
      } else if (
        req.files &&
        req.files.contentImages &&
        req.files.contentImages.length > 0
      ) {
        for (const file of req.files.contentImages) {
          const fileContent = await dataUri(file);
          const result = await uploader.upload(fileContent, {
            resource_type: "auto",
            allowed_formats: ["jpg", "png", "webp"],
          });

          contentImagePublicIds.push({ publicId: result.public_id });

          const imageUrl = cloudinary.v2.url(result.public_id, {
            fetch_format: "auto",
            quality: "auto",
          });

          contentImageUrls.push(imageUrl);
        }
      }

      // Create info fields array
      const infoFields = [];
      if (infoLabels && infoValues) {
        // If infoLabels is a string, convert to array
        const labelsArray = Array.isArray(infoLabels)
          ? infoLabels
          : [infoLabels];
        const valuesArray = Array.isArray(infoValues)
          ? infoValues
          : [infoValues];

        for (let i = 0; i < labelsArray.length; i++) {
          if (labelsArray[i] && valuesArray[i]) {
            infoFields.push({
              label: labelsArray[i],
              value: valuesArray[i],
            });
          }
        }
      }

      // Generate HTML content preserving the order of paragraphs and images
      let htmlContent = "";

      // Convert input arrays to ensure they're arrays even if single items
      const subtitlesArray = Array.isArray(subtitles)
        ? subtitles
        : subtitles
        ? [subtitles]
        : [];
      const paragraphsArray = Array.isArray(paragraphs)
        ? paragraphs
        : paragraphs
        ? [paragraphs]
        : [];
      const imageCaptionsArray = Array.isArray(imageCaptions)
        ? imageCaptions
        : imageCaptions
        ? [imageCaptions]
        : [];

      // Track paragraph and image counters
      let paragraphCounter = 0;
      let imageCounter = 0;

      // If sectionOrder is provided (from the form), use it to determine content order
      if (sectionOrder && sectionTypes) {
        const orderArray = Array.isArray(sectionOrder)
          ? sectionOrder
          : [sectionOrder];
        const typesArray = Array.isArray(sectionTypes)
          ? sectionTypes
          : [sectionTypes];

        // Process sections in the order provided
        for (let i = 0; i < orderArray.length; i++) {
          const index = parseInt(orderArray[i], 10);
          const type = typesArray[i];

          if (type === "paragraph") {
            // Add paragraph with subtitle if available
            if (paragraphCounter < paragraphsArray.length) {
              const subtitle = subtitlesArray[paragraphCounter] || "";
              const paragraph = paragraphsArray[paragraphCounter] || "";

              if (subtitle) {
                htmlContent += `<h2>${subtitle}</h2>`;
              }

              if (paragraph) {
                htmlContent += `<p>${paragraph}</p>`;
              }

              paragraphCounter++;
            }
          } else if (type === "image") {
            // Add image with caption if available
            if (imageCounter < contentImageUrls.length) {
              const caption = imageCaptionsArray[imageCounter] || "";

              htmlContent += `
              <div class="article-image">
                <img src="${contentImageUrls[imageCounter]}" alt="${caption}">
                ${caption ? `<p class="image-caption">${caption}</p>` : ""}
              </div>
              `;

              imageCounter++;
            }
          }
        }
      } else {
        // Fallback to the old method if no ordering data is provided
        // Add paragraphs and subtitles
        for (let i = 0; i < paragraphsArray.length; i++) {
          if (subtitlesArray[i]) {
            htmlContent += `<h2>${subtitlesArray[i]}</h2>`;
          }

          if (paragraphsArray[i]) {
            htmlContent += `<p>${paragraphsArray[i]}</p>`;
          }
        }

        // Add images with captions
        for (let i = 0; i < contentImageUrls.length; i++) {
          const caption = imageCaptionsArray[i] || "";
          htmlContent += `
          <div class="article-image">
            <img src="${contentImageUrls[i]}" alt="${caption}">
            ${caption ? `<p class="image-caption">${caption}</p>` : ""}
          </div>
          `;
        }
      }

      // Create new news article
      const newNewsArticle = new News({
        title,
        urlSlug: finalUrlSlug,
        infoImage: {
          url: infoImageUrl,
          alt: infoImageAlt,
          publicId: infoImagePublicId,
        },
        infoFields,
        content: htmlContent,
        contentImageIds: contentImagePublicIds,
        publishDate: publishDate ? new Date(publishDate) : new Date(),
        category: category || "General",
        featured: featured === "true" || featured === true,
        createdBy: req.session?.userId,
        author: req.session?.username,
        createdAt: new Date(),
        lastModified: new Date(),
      });

      // Save news article
      await newNewsArticle.save();

      // Return success with the URL
      res.status(200).json({
        success: true,
        message: "News article created successfully",
        url: `/news/${finalUrlSlug}`,
      });
    } catch (error) {
      console.error("News Article Creation Error:", error);
      res.status(500).json({
        success: false,
        message: "Error creating news article",
        error: error.message,
      });
    }
  }
);

// Delete news article
router.delete("/api/news/:id", isAuthenticated, async (req, res) => {
  try {
    // Validate the ID format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid news article ID format",
      });
    }

    // Find news article before deletion to get image IDs
    const newsArticle = await News.findById(req.params.id);

    if (!newsArticle) {
      return res.status(404).json({
        success: false,
        message: "News article not found",
      });
    }

    // Delete images from Cloudinary
    // Delete info image if it exists
    if (newsArticle.infoImage && newsArticle.infoImage.publicId) {
      await cloudinary.v2.uploader.destroy(newsArticle.infoImage.publicId);
    }

    // Delete content images if they exist
    if (newsArticle.contentImageIds && newsArticle.contentImageIds.length > 0) {
      for (const imageId of newsArticle.contentImageIds) {
        if (imageId.publicId) {
          await cloudinary.v2.uploader.destroy(imageId.publicId);
        }
      }
    }

    // Now delete the news article
    const result = await News.findByIdAndDelete(req.params.id);

    // Return success
    res.status(200).json({
      success: true,
      message: "News article deleted successfully",
    });
  } catch (error) {
    console.error("News Article Deletion Error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting news article",
      error: error.message,
    });
  }
});

export default router;
