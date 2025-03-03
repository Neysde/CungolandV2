import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import expressLayouts from "express-ejs-layouts";

const router = express.Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

//router.use(expressLayouts);
router.use("/css", express.static(path.join(__dirname, "../../views/css")));
router.use("/js", express.static(path.join(__dirname, "../../views/js")));

router.get("/api/login", (req, res) => {
  res.render("login.ejs", { title: "Login | Cungoland" });
});

router.get("/api/dashboard", (req, res) => {
  res.render("dashboard.ejs", { title: "Dashboard | Cungoland" });
});

export default router;
