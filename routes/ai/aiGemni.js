// routes/ai/aiGemni.js
const express = require("express");
const axios = require("axios");
require("dotenv").config(); // Load environment variables from .env file
const app = express();

const router = express.Router();

// Gemini AI API Key from the .env file
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Get the API key from environment variables


// POST route to generate text based on the keyword
app.post("/api/ai/generate-text", async (req, res) => {
  try {
    const { keyword } = req.body;
    if (!keyword) {
      return res.status(400).json({ message: "Keyword is required" });
    }

    const response = await axios.post("https://api.gemini.ai/generate-text", {
      prompt: `Generate a creative text based on the following keyword: "${keyword}"`,
      max_tokens: 150,
      temperature: 0.7,
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error generating text:", error.message);
    res
      .status(500)
      .json({ message: "Failed to generate text. Please try again." });
  }
});

module.exports = router;
