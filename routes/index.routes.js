const express = require('express');
const authMiddleware = require('../middlewares/auth');
const router = express.Router();
const upload = require('../config/multer'); // your multer config
const fileModel = require('../models/files.models'); // Mongoose model

// Render home page
router.get('/home', authMiddleware, async (req, res) => {

const userFiles = await fileModel.find({
  user: req.user.userId
})

console.log(userFiles)

  res.render('home', {
    files: userFiles
  }); // Renders views/home.ejs
});

// File upload route
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    // Save file details to MongoDB with user info
    const newFile = await fileModel.create({
      path: req.file.path,
      originalname: req.file.originalname,
      user: req.user.userId, // updated line
    });

    console.log("File saved to DB:", newFile);
    res.json(newFile); // updated line
  } catch (err) {
    console.error("Error during upload:", err);
    res.status(500).send("Something went wrong during upload.");
  }
});

module.exports = router;
