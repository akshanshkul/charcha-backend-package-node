// middleware/checkAdminRole.js

// Middleware for checking if user is an admin, superadmin, or other roles
const checkAdminRole = (roles) => {
    return (req, res, next) => {
      // Ensure that the user is authenticated (req.user should exist)
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
  
      // Check if the user's role is one of the allowed roles
      if (roles.includes(req.user.role)) {
        return next();  // Role is allowed, proceed to the next middleware or route
      }
  
      return res.status(403).json({ message: "Forbidden" });  // Role not allowed
    };
  };
module.exports = checkAdminRole;
  