import express from "express";

import usersRouter from "./users-router.mjs";
import pageRouter from "./page-router.mjs";
import imageUploadRouter from "./image-upload.mjs";
const router = express.Router();

router.use(usersRouter);
router.use(pageRouter);
router.use(imageUploadRouter);
export default router;
