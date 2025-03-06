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

const multerUploads = multer({ storage }).single("image");

const createDataURI = async (buffer) => {
  const type = await fileTypeFromBuffer(buffer);
  if (!type?.mime.startsWith("image/")) {
    throw new Error("Invalid file type");
  }
  return `data:${type.mime};base64,${buffer.toString("base64")}`;
};

const dataUri = async (req) => {
  if (!req.file?.buffer) throw new Error("No file uploaded");
  return createDataURI(req.file.buffer);
};

export { multerUploads, dataUri };

//auth check for dashboard
export function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next();
  }
  res.redirect("/api/login");
}
