const express = require("express");
const router = express.Router();
const Admin = require("../../models/admin/Admin"); // Ensure correct path to the Admin model
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken"); // Add JWT to sign the token
const checkAdminRole = require("../../middleware/checkAdminRole"); // Include the checkAdminRole middleware
const apiAuth = require("../../middleware/apiAuth"); // Include the apiAuth middleware

// Apply API key authentication middleware globally
router.use(apiAuth);

// Route to create an admin or superadmin user
router.post("/create", checkAdminRole(["superadmin"]), async (req, res) => {
  const { username, email, password, role } = req.body;

  // Check if the superadmin trying to create a new user is allowed to do so
  const loggedInAdmin = req.admin; // This is set by the apiAuth middleware (assuming it's set as the logged-in user)

  // If the logged-in superadmin is trying to create a superadmin, ensure it's allowed
  if (role === "superadmin" && loggedInAdmin.role !== "superadmin") {
    return res
      .status(403)
      .json({ message: "Only a superadmin can create another superadmin." });
  }

  // Only "admin" or "superadmin" roles are allowed
  if (role && !["admin", "superadmin"].includes(role)) {
    return res
      .status(400)
      .json({
        message: "Invalid role. Only 'admin' and 'superadmin' are allowed.",
      });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

    const newAdmin = new Admin({
      username,
      email,
      password: hashedPassword,
      role: role || "admin", // Default to "admin" role if no role is provided
      lastLogin: null,
      passwordUpdatedAt: new Date(),
      createdAt: new Date(),
    });

    await newAdmin.save();
    return res
      .status(201)
      .json({ message: "Admin user created successfully!" });
  } catch (error) {
    console.error("Error creating admin user: ", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Route to login an admin user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Compare the password with the stored hash
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create a JWT token
    const payload = {
      id: admin._id,
      username: admin.username,
      role: admin.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    }); // Set the expiration as needed

    return res.status(200).json({
      message: "Login successful",
      token, // Send back the JWT token
    });
  } catch (error) {
    console.error("Error logging in admin user: ", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Route to get all admin users
router.get("/users", checkAdminRole(["superadmin"]), async (req, res) => {
  try {
    const admins = await Admin.find();
    return res.status(200).json(admins);
  } catch (error) {
    console.error("Error fetching admin users: ", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Route to update admin user details (e.g., update role or password)
router.put("/update/:id", checkAdminRole(["superadmin"]), async (req, res) => {
  const { id } = req.params;
  const { username, email, password, role } = req.body;

  try {
    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Optionally update the fields
    if (username) admin.username = username;
    if (email) admin.email = email;
    if (password) admin.password = await bcrypt.hash(password, 10);
    if (role) admin.role = role;

    admin.passwordUpdatedAt = new Date(); // Update password update time
    await admin.save();

    return res
      .status(200)
      .json({ message: "Admin user updated successfully!" });
  } catch (error) {
    console.error("Error updating admin user: ", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Route to delete an admin user
router.delete(
  "/delete/:id",
  checkAdminRole(["superadmin"]),
  async (req, res) => {
    const { id } = req.params;

    try {
      const admin = await Admin.findByIdAndDelete(id);
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }

      return res
        .status(200)
        .json({ message: "Admin user deleted successfully!" });
    } catch (error) {
      console.error("Error deleting admin user: ", error);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
