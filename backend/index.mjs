import express from "express";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import route from "./routes/route.mjs";
import ejs from "ejs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());
// Set up view engine
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "ejs");

const PORT = process.env.PORT || 3000;

const connectionString =
  "mongodb+srv://root:1Ow6PKsLv1It8K2S@cluster0.ok6h4.mongodb.net/cungoland?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(connectionString) // just change localhost to 0.0.0.0 to prevent error. (MongoDB seems to be not compatible with NodeJS v17)
  .then(() => console.log("Connected to the database."))
  .catch((err) => console.log(`Error: ${err}`));

app.use(route);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
