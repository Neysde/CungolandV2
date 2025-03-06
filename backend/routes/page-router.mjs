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
router.get("/api/dashboard", isAuthenticated, (req, res) => {
  res.render("dashboard.ejs", { title: "Dashboard | Cungoland" });
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
router.get("/api/wiki/:slug", async (req, res) => {
  try {
    // Find wiki by slug
    const wiki = await Wiki.findOne({ urlSlug: req.params.slug });

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

      // Check if wiki with this slug already exists
      const existingWiki = await Wiki.findOne({ urlSlug: finalUrlSlug });
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
      const newWiki = new Wiki({
        title,
        urlSlug: finalUrlSlug,
        infoImage: {
          url: infoImageUrl,
          alt: infoImageAlt,
        },
        infoFields,
        content: htmlContent,
        createdBy: req.user?._id, // If user authentication is implemented
      });

      // Save wiki to database
      await newWiki.save();

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
