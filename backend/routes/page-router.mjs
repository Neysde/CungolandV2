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

    res.render("dashboard.ejs", {
      title: "Dashboard | Cungoland",
      wikis: wikis,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.render("dashboard.ejs", {
      title: "Dashboard | Cungoland",
      wikis: [],
    });
  }
});

router.get("/api/wiki", (req, res) => {
  res.render("wiki.ejs", {
    title: "Page Title",
    imageUrl: "/path/to/image.jpg",
    imageAlt: "Description of image",
    founder: "Friedrich Müller",
    foundingDate: "04.08.1948",
    currentHead: "Karl Szafnauer",
    additionalInfo: [{ label: "Additional Field", value: "Value" }],
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    lastModified: "Date string",
  });
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

      if (req.files && req.files.infoImage && req.files.infoImage.length > 0) {
        const fileContent = await dataUri(req.files.infoImage[0]);
        const result = await uploader.upload(fileContent, {
          resource_type: "auto",
          allowed_formats: ["jpg", "png", "webp"],
        });

        infoImageUrl = cloudinary.v2.url(result.public_id, {
          fetch_format: "auto",
          quality: "auto",
        });
      }

      // Process content images - check both field name formats
      const contentImageUrls = [];
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
            },
            infoFields,
            content: htmlContent,
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

    // Delete wiki by ID
    const objectId = new mongoose.Types.ObjectId(req.params.id);
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
      if (req.files && req.files.infoImage && req.files.infoImage.length > 0) {
        const fileContent = await dataUri(req.files.infoImage[0]);
        const result = await uploader.upload(fileContent, {
          resource_type: "auto",
          allowed_formats: ["jpg", "png", "webp"],
        });

        infoImageUrl = cloudinary.v2.url(result.public_id, {
          fetch_format: "auto",
          quality: "auto",
        });
      }

      // Process content images - check both field name formats
      const contentImageUrls = [];
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
        },
        infoFields,
        content: htmlContent,
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

export default router;
