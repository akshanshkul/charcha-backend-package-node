// app.js

// const express = require("express");
// const mongoose = require("mongoose");
// const bodyParser = require("body-parser");
// const helmet = require("helmet");
// const morgan = require("morgan");
// const dotenv = require("dotenv");
// const app = express();
// const bcrypt = require("bcrypt");
// const cors = require('cors');
// app.use(cors());

// // Load environment variables
// dotenv.config();

// // Middleware
// app.use(helmet()); // Adds security headers
// app.use(bodyParser.json());
// app.use(express.json()); // Handles JSON request bodies
// app.use(morgan("combined")); // Logging HTTP requests

// // MongoDB Connection
// mongoose
//   .connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/charcha", {
//     useNewUrlParser: true,
//     // useFindAndModify: false,
//   })
//   .then(() => console.log("MongoDB connected"))
//   .catch((err) => console.error("MongoDB connection error:", err));



// // Import Routes
// const userRoutes = require("./routes/user/userRoutes");
// app.use("/api/users", userRoutes);
// const apiRoutes = require("./routes/apiKeyRoutes");
// app.use("/api/key", apiRoutes);
// const adminRoutes = require("./routes/admin/adminRoutes");
// app.use("/api/admin", adminRoutes);
// app.use("/uploads", express.static("uploads"));

// // Basic Route
// app.get("/", (req, res) => {
//   res.send("Hello, World!");
// });

// // Global Error Handling Middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ message: "Internal Server Error" });
// });

// // Start server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// // Handle uncaught exceptions and unhandled promise rejections
// process.on("uncaughtException", (err) => {
//   console.error("Uncaught Exception:", err);
//   process.exit(1);
// });

// process.on("unhandledRejection", (err) => {
//   console.error("Unhandled Rejection:", err);
//   process.exit(1);
// });


const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");
const cors = require("cors");
const app = express();
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");

app.use(cors());

// Load environment variables
dotenv.config();

// Middleware
app.use(helmet()); // Adds security headers
app.use(express.json()); // Handles JSON request bodies
app.use(morgan("combined")); // Logging HTTP requests

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/charcha", {
    useNewUrlParser: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Set up storage engine for multer (image upload)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Store uploaded files in the 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Set the file name to include timestamp
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max file size 5MB
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
}).single("image"); // Expect a single image file field called 'image'

// Import Routes
const userRoutes = require("./routes/user/userRoutes");
app.use("/api/users", userRoutes);
const apiRoutes = require("./routes/apiKeyRoutes");
app.use("/api/key", apiRoutes);
const adminRoutes = require("./routes/admin/adminRoutes");
app.use("/api/admin", adminRoutes);

// Post Routes
const postRoutes = require("./routes/post/postRoutes");
app.use("/api/posts", postRoutes);

const aiRoutes = require("./routes/ai/aiGemni");
app.use("/api/ai", aiRoutes);

// Serve static files (image upload folder)
app.use("/uploads", express.static("uploads"));

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
