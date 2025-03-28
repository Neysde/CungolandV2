import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { User } from "../mongoose/schemas/user.mjs";
import { hashPassword, comparePassword } from "../encryptpass.mjs";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const router = express.Router();

// Session middleware is now in index.mjs, no need to duplicate here

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

    console.log("Login attempt for:", username);

    const user = await User.findOne({ username: username });

    if (!user) {
      console.log("User not found:", username);
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isPasswordValid = comparePassword(password, user.password);

    if (!isPasswordValid) {
      console.log("Invalid password for:", username);
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Set the session properties directly
    req.session.userId = user._id.toString(); // Convert ObjectId to string
    req.session.username = user.username;
    req.session.isAuthenticated = true;

    console.log("Session set:", {
      userId: req.session.userId,
      username: req.session.username,
      isAuthenticated: req.session.isAuthenticated,
    });

    // Respond immediately without waiting for session.save()
    return res.status(200).json({
      success: true,
      message: "Login successful",
      redirectUrl: "/api/dashboard",
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "An error occurred during login" });
  }
});

// Add logout route
router.get("/api/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Failed to logout" });
    }
    res.redirect("/api/login");
  });
});

export default router;
