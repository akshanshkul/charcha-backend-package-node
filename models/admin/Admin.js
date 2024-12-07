// models/admin/Admin.js

const mongoose = require("mongoose");

// Define the schema for the Admin User model with additional fields
const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: "admin", // Default role is admin
        enum: ["admin", "superadmin"] // Allowed roles
    },
    lastLogin: {
        type: Date,
        default: null // Will be updated when the user logs in
    },
    passwordUpdatedAt: {
        type: Date,
        default: null // Will be updated when the password is changed
    },
    createdAt: {
        type: Date,
        default: Date.now // Automatically set when the user is created
    }
});

// Create the Admin User model from the schema
const Admin = mongoose.model('Admin-User', adminSchema);

module.exports = Admin;
