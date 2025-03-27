import express from "express";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import route from "./routes/route.mjs";
import ejs from "ejs";
import { notFoundHandler, errorHandler } from "./middlewares.mjs";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());

// Set up view engine
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "ejs");

// Use environment variable for PORT
const PORT = process.env.PORT || 3000;

// Use environment variable for MongoDB connection string
const connectionString = process.env.MONGODB_URI;

mongoose
  .connect(connectionString) // just change localhost to 0.0.0.0 to prevent error. (MongoDB seems to be not compatible with NodeJS v17)
  .then(() => console.log("Connected to the database."))
  .catch((err) => console.log(`Error: ${err}`));

app.use(route);

// Use the 404 handler middleware for routes that don't match
app.use(notFoundHandler);

// Use the error handler middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
