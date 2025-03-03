import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { User } from "../mongoose/schemas/user.mjs";
import { hashPassword, comparePassword } from "../encryptpass.mjs";

const router = express.Router();

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
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/api/login", async (req, res) => {
  try {
    const {
      body: { username, password },
    } = req;

    const user = await User.findOne({ username: username });

    if (!user) {
      return res.status(401).send("Invalid username or password");
    }

    const isPasswordValid = comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).send("Invalid username or password");
    }

    // Redirect to the dashboard on successful login
    return res.status(200).send("Login successful");
  } catch (err) {
    res.status(400).send(err);
  }
});

export default router;
