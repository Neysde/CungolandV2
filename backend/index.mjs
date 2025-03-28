import express from "express";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import route from "./routes/route.mjs";
import ejs from "ejs";
import { notFoundHandler, errorHandler } from "./middlewares.mjs";
import dotenv from "dotenv";
import session from "express-session";
import cookieParser from "cookie-parser";
import MongoStore from "connect-mongo";

// Load environment variables from .env file
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Use environment variable for MongoDB connection string
const connectionString = process.env.MONGODB_URI;

// Connect to MongoDB first
mongoose
  .connect(connectionString) // just change localhost to 0.0.0.0 to prevent error. (MongoDB seems to be not compatible with NodeJS v17)
  .then(() => console.log("Connected to the database."))
  .catch((err) => console.log(`Error: ${err}`));

// Configure session middleware (must be before route)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "cungoland-secret-key",
    resave: true,
    saveUninitialized: true,
    proxy: true, // Trust the reverse proxy
    store: MongoStore.create({
      mongoUrl: connectionString,
      ttl: 24 * 60 * 60, // 1 day
      autoRemove: "native",
    }),
    cookie: {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
    name: "cungoland.sid",
  })
);

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Set up view engine
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "ejs");

// Use environment variable for PORT
const PORT = process.env.PORT || 3000;

app.use(route);

// Use the 404 handler middleware for routes that don't match
app.use(notFoundHandler);

// Use the error handler middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
