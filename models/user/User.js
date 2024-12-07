// models/user/User.js

const mongoose = require('mongoose');

// Define the schema for the User model
const userSchema = new mongoose.Schema({
  // Basic user information
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Password field (ensure proper hashing in practice)
  userName:{type:String,required:true,unique: true},
  // Profile details
  profilePicture: { type: String }, // URL or path to profile picture
  bio: { type: String }, // Short bio or description

  // Social media handles
  twitterHandle: { type: String}, // Use `sparse` to allow nulls
  facebookProfile: { type: String }, // Facebook profile URL, optional
  instagramHandle: { type: String, unique: true }, // Instagram handle, optional

  // College information
  collegeName: { type: String }, // Name of the college
  course: { type: String }, // Course or major at the college

  // Coaching and additional information
  coachingFor: { type: String }, // Details about coaching (e.g., UPSC, JEE, etc.)
  coachingInstitute: { type: String }, // Name of the coaching institute

  // Personal details
  currentPlace: { type: String }, // Current place or city
  hometown: { type: String }, // Hometown
  hobbies: [String], // Array of hobbies
  favoriteSubjects: [String], // Array of favorite subjects
  phoneNumber: { type: String }, // Phone number

  // Account status
  isActive: { type: Boolean, default: true }, // Whether the user account is active
  isVerified: { type: Boolean, default: false }, // Whether the email is verified
  createdAt: { type: Date, default: Date.now }, // Account creation date

  // Additional fields can be added as needed
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

// Create the User model from the schema
const User = mongoose.model('User', userSchema);

module.exports = User;
