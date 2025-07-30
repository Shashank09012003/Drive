const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// GET Register Page
router.get("/register", (req, res) => {
  res.render("register");
});

// POST Register User
router.post(
  "/register",
  [
    body("email").trim().isEmail().withMessage("Enter a valid email"),
    body("password").trim().isLength({ min: 5 }).withMessage("Password must be at least 5 characters"),
    body("username").trim().isLength({ min: 3 }).withMessage("Username must be at least 3 characters")
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: "Invalid data",
      });
    }

    const { email, username, password } = req.body;

    try {
      const existingUser = await userModel.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await userModel.create({
        email,
        username,
        password: hashedPassword,
      });

      res.status(201).json(newUser);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

// GET Login Page
router.get("/login", (req, res) => {
  res.render("login");
});

// POST Login User
router.post(
  "/login",
  [
    body("username").trim().isLength({ min: 3 }).withMessage("Invalid username"),
    body("password").trim().isLength({ min: 5 }).withMessage("Invalid password")
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: "Invalid data",
      });
    }

    const { username, password } = req.body;

    try {
      const user = await userModel.findOne({ username });

      if (!user) {
        return res.status(400).json({ message: "Username or password is incorrect" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Username or password is incorrect" });
      }

      const token = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          username: user.username,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 3600000, // 1 hour
      });

      res.send("Logged in successfully");
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

module.exports = router;
