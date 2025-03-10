import express from "express";

import usersRouter from "./users-router.mjs";
import pageRouter from "./page-router.mjs";
import imageUploadRouter from "./image-upload.mjs";
import twitterRouter from "./twitter-router.mjs";
import photoRouter from "./photo-router.mjs";

const router = express.Router();

router.use(usersRouter);
router.use(pageRouter);
router.use(imageUploadRouter);
router.use(twitterRouter);
router.use(photoRouter);

export default router;
