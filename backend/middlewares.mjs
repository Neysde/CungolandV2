import { config, uploader, v2 as cloudinary } from "cloudinary";
import multer from "multer";
import path from "path";
import { fileTypeFromBuffer } from "file-type";

//cloudiary
const cloudinaryConfig = (req, res, next) => {
  config({
    cloud_name: "dttnr1rnp",
    api_key: "188769541222425",
    api_secret: "V2q-K0FstkjSRaULlmdEMYQUXlc",
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
  if (req.session.userId) {
    return next();
  }
  res.redirect("/api/login");
}
