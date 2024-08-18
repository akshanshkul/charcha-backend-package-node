// routes/user/userRoutes.js

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const apiAuth = require("../../middleware/apiAuth");

const User = require("../../models/user/user");

// Apply API key authentication middleware
router.use(apiAuth);

// Register a new user
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    // Save user to database
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Get All Users
router.get("/allUser", async (req, res) => {
  try {
    // Fetch all user documents from the User collection
    const users = await User.find();
    // Send the list of users as a JSON response
    res.json(users);
  } catch (err) {
    // Handle errors by sending a 500 status code and error message
    res.status(500).json({ error: err.message });
  }
});

// Get a Single User
router.get("/id/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a User
router.put("/update/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a User
router.delete("/delete/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (user) {
      res.json({ message: "User deleted" });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Follow a user
router.post("/follow/:id", async (req, res) => {
  try {
    const userId = req.body.userId; // The ID of the user who is following
    const followUserId = req.params.id; // The ID of the user to be followed

    // Ensure both users exist
    const user = await User.findById(userId);
    const followUser = await User.findById(followUserId);
    if (!user || !followUser) {
      return res.status(404).json({ message: "User(s) not found" });
    }

    // Check if already following
    if (user.following.includes(followUserId)) {
      return res.status(400).json({ message: "Already following this user" });
    }

    // Add followUserId to user's following and userId to followUser's followers
    user.following.push(followUserId);
    followUser.followers.push(userId);

    // Save both users
    await user.save();
    await followUser.save();

    res.status(200).json({ message: "Followed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Unfollow a user
router.post("/unfollow/:id", async (req, res) => {
  try {
    const userId = req.body.userId; // The ID of the user who is unfollowing
    const unfollowUserId = req.params.id; // The ID of the user to be unfollowed

    // Ensure both users exist
    const user = await User.findById(userId);
    const unfollowUser = await User.findById(unfollowUserId);
    if (!user || !unfollowUser) {
      return res.status(404).json({ message: "User(s) not found" });
    }

    // Check if not following
    if (!user.following.includes(unfollowUserId)) {
      return res.status(400).json({ message: "Not following this user" });
    }

    // Remove unfollowUserId from user's following and userId from unfollowUser's followers
    user.following.pull(unfollowUserId);
    unfollowUser.followers.pull(userId);

    // Save both users
    await user.save();
    await unfollowUser.save();

    res.status(200).json({ message: "Unfollowed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Check follow relationships
router.get("/follow-check", async (req, res) => {
  try {
    const { userId, otherUserId } = req.query;

    if (!userId || !otherUserId) {
      return res
        .status(400)
        .json({ message: "Both userId and otherUserId are required" });
    }

    // Find both users
    const user = await User.findById(userId);
    const otherUser = await User.findById(otherUserId);

    if (!user || !otherUser) {
      return res.status(404).json({ message: "One or both users not found" });
    }

    // Check if user is following the otherUser
    const isUserFollowing = user.following.includes(otherUserId);

    // Check if otherUser is following the user
    const isOtherUserFollowing = otherUser.following.includes(userId);

    // Determine response based on follow relationships
    if (isUserFollowing && isOtherUserFollowing) {
      return res.json({ relationship: "mutual" });
    } else if (isUserFollowing) {
      return res.json({ relationship: "userFollowsOther" });
    } else if (isOtherUserFollowing) {
      return res.json({ relationship: "otherUserFollowsUser" });
    } else {
      return res.json({ relationship: "none" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
