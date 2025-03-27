import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { User } from "../mongoose/schemas/user.mjs";
import { hashPassword, comparePassword } from "../encryptpass.mjs";
import session from "express-session";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const router = express.Router();

router.use(
  session({
    secret: process.env.SESSION_SECRET, // Using environment variable for session secret
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // Only use secure cookies in production
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

router.post("/api/register", (req, res) => {
  try {
    const {
      body: { username, password },
    } = req;

    const hashedPassword = hashPassword(password);

    const newUser = new User({
      username: username,
      password: hashedPassword,
    });

    const savedUser = newUser.save();
    res.status(201).send(savedUser);

    if (!hashedPassword) {
      throw new Error("Username or password is invalid");
    }
  } catch (err) {
    res.status(400).send(err);
    console.log(err);
  }
});

router.post("/api/login", async (req, res) => {
  try {
    const {
      body: { username, password },
    } = req;

    const user = await User.findOne({ username: username });

    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isPasswordValid = comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Set the session properties
    req.session.userId = user._id;
    req.session.username = user.username;

    // Save the session before responding
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res
          .status(500)
          .json({ message: "Session error. Please try again." });
      }

      // Respond with success and the redirect URL
      return res.status(200).json({
        success: true,
        message: "Login successful",
        redirectUrl: "/api/dashboard",
      });
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "An error occurred during login" });
  }
});

export default router;
