// app.js

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");
const app = express();
const bcrypt = require("bcrypt");

// Load environment variables
dotenv.config();

// Middleware
app.use(helmet()); // Adds security headers
app.use(bodyParser.json());
app.use(express.json()); // Handles JSON request bodies
app.use(morgan("combined")); // Logging HTTP requests

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/charcha", {
    useNewUrlParser: true,
    // useUnifiedTopology: true,
    // useFindAndModify: false,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));



// Import Routes
const userRoutes = require("./routes/user/userRoutes");
app.use("/api/users", userRoutes);
const apiRoutes = require("./routes/apiKeyRoutes");
app.use("/api/key", apiRoutes);
// Basic Route
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle uncaught exceptions and unhandled promise rejections
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  process.exit(1);
});
