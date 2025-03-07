import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { User } from "../mongoose/schemas/user.mjs";
import { hashPassword, comparePassword } from "../encryptpass.mjs";

import session from "express-session";

const router = express.Router();

router.use(
  session({
    secret: "::SESSION_SECRET::", // Replace with a strong secret
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Set to true if using HTTPS
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
      return res.status(401).send({ message: "Invalid username or password" });
    }

    const isPasswordValid = comparePassword(password, user.password);

    if (!user && !isPasswordValid) {
      return res.status(401).send({ message: "Invalid username or password" });
    }

    if (user && !isPasswordValid) {
      return res.status(401).send({ message: "Invalid username or password" });
    }

    req.session.userId = user._id;
    req.session.username = user.username;

    // Redirect to the dashboard on successful login
    return res.status(200).send("Login successful");
  } catch (err) {
    return res.status(400).send(err);
  }
});

export default router;
