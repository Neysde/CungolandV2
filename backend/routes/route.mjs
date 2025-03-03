import express from "express";

import usersRouter from "./users-router.mjs";
import pageRouter from "./page-router.mjs";
const router = express.Router();

router.use(usersRouter);
router.use(pageRouter);

export default router;
