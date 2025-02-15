// routes/post/postRoutes.js
const express = require("express");
const multer = require("multer");
const Post = require("../../models/post/Post");
const path = require("path");

// Set up storage engine for multer
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

const router = express.Router();

// Fetch all posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "username")
      .populate("comments.user", "username");
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Error fetching posts", error: err });
  }
});

// Add a new post (with or without image)
router.post("/", upload, async (req, res) => {
  try {
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`; // Image URL (relative path)
    }

    const newPost = new Post({
      user: req.body.user,
      content: req.body.content,
      image: imageUrl, // Store the image URL if image is uploaded
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ message: "Error creating post", error: err });
  }
});

// Add a comment to a post
router.post("/:postId/comments", async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = {
      user: req.body.user,
      text: req.body.text,
    };

    post.comments.push(comment);
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: "Error adding comment", error: err });
  }
});

// PUT /api/posts/:postId to update a post
router.put('/:postId', async (req, res) => {
  const { postId } = req.params;
  const { text, image } = req.body; // Assuming image is sent as URL or image ID

  try {
    // Find the post by ID
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the user is the author of the post (assuming you have a user ID in the request)
    if (post.user !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to edit this post' });
    }

    // Update the post's content
    post.text = text || post.text;
    post.image = image || post.image;

    // Save the updated post
    await post.save();

    res.status(200).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// PUT /api/posts/:postId/comments/:commentId to update a comment
router.put('/:postId/comments/:commentId', async (req, res) => {
  const { postId, commentId } = req.params;
  const { text } = req.body;

  try {
    // Find the post by ID and populate the comments array
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Find the comment by ID within the post's comments array
    const comment = post.comments.id(commentId); // Access the comment by its ID

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    console.log('Comment found:', comment); // Debugging line: Check the comment object

    // Check if the user is the author of the comment (assuming req.user.id is the authenticated user ID)
    if (!comment.user) {
      return res.status(400).json({ message: 'Comment user is missing' });
    }

    console.log('Comment User:', comment.user); // Debugging line: Check the user field

    // Check if the user is the author of the comment
    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to edit this comment' });
    }

    // Update the comment's text
    comment.text = text || comment.text;

    // Save the updated post (which will save the updated comment)
    await post.save();

    res.status(200).json(post); // Return the updated post (or the updated comment if preferred)
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
