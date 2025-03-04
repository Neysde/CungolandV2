import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import expressLayouts from "express-ejs-layouts";
import { isAuthenticated } from "../middlewares.mjs";

const router = express.Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

router.use(expressLayouts);
router.use("/css", express.static(path.join(__dirname, "../../views/css")));
router.use("/js", express.static(path.join(__dirname, "../../views/js")));

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

export default router;
