import { config, uploader, v2 as cloudinary } from "cloudinary";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { fileTypeFromBuffer } from "file-type";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

//cloudiary
const cloudinaryConfig = (req, res, next) => {
  config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  next();
};
export { cloudinaryConfig, uploader, cloudinary };

const storage = multer.memoryStorage();

// Updated to handle multiple files with different field names
const multerUploads = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
}).fields([
  { name: "image", maxCount: 1 },
  { name: "infoImage", maxCount: 1 },
  { name: "contentImages[]", maxCount: 10 }, // Updated field name with array notation
  { name: "contentImages", maxCount: 10 }, // Also include without array notation for compatibility
  { name: "tweetImage", maxCount: 1 }, // Add tweetImage field for the tweet form
]);

const createDataURI = async (buffer) => {
  const type = await fileTypeFromBuffer(buffer);
  if (!type?.mime.startsWith("image/")) {
    throw new Error("Invalid file type");
  }
  return `data:${type.mime};base64,${buffer.toString("base64")}`;
};

// Updated to handle both single file and file object
const dataUri = async (fileOrReq) => {
  // If it's a request object with a file property
  if (fileOrReq.file?.buffer) {
    return createDataURI(fileOrReq.file.buffer);
  }

  // If it's a file object directly (from req.files[fieldname][index])
  if (fileOrReq.buffer) {
    return createDataURI(fileOrReq.buffer);
  }

  throw new Error("No file buffer found");
};

export { multerUploads, dataUri };

//auth check for dashboard
export function isAuthenticated(req, res, next) {
  // Debug logging for troubleshooting on Vercel
  console.log("Session check:", {
    hasSession: !!req.session,
    userId: req.session?.userId,
    isAuthenticated: req.session?.isAuthenticated,
  });

  if (req.session && (req.session.userId || req.session.isAuthenticated)) {
    return next();
  }

  // Check if it's an AJAX request by examining multiple indicators
  const isAjaxRequest =
    req.xhr ||
    req.headers.accept?.includes("application/json") ||
    req.headers["content-type"]?.includes("application/json") ||
    req.headers["x-requested-with"] === "XMLHttpRequest";

  if (isAjaxRequest) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
      redirectUrl: "/api/login",
    });
  }

  // For regular requests, redirect to login page
  res.redirect("/api/login");
}

// 404 handler for routes that don't match any previous routes
export function notFoundHandler(req, res, next) {
  // Render the error.ejs template with a 404 message
  res.status(404).render("error", {
    message: "Page not found. The requested URL does not exist.",
    error: { status: 404 },
    layout: false,
  });
}

// General error handler middleware
export function errorHandler(err, req, res, next) {
  // Log the error for server-side debugging
  console.error(err.stack);

  // Set status code (default to 500 if none provided)
  const statusCode = err.status || 500;

  // Render the error.ejs template
  res.status(statusCode).render("error", {
    message:
      statusCode === 404
        ? "Page not found"
        : "Something went wrong on our end.",
    error: process.env.NODE_ENV === "development" ? err : null,
  });
}
