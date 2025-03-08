const jwt = require("jsonwebtoken");
const User = require("../models/user");

const JWT_SECRET =
  "f2d5c6a3b798e0f4a6e2c9d1b8a7f5e3c6d4e8b9a5c1d7f2b6a3e9d0c8f4b2e5";

// Basic authentication middleware
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.userId) {
      return res.status(400).json({ message: "Invalid token payload" });
    }

    // Fetch user data
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Attach user data to request
    req.user = decoded;
    req.userData = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Token expired, please log in again" });
    }

    res.status(401).json({ message: "Token is not valid" });
  }
};

// Role-based middleware
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authorization required" });
    }
    if (req.user.role !== role) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

// Middleware for routes accessible to multiple roles
const allowRoles = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authorization required" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

module.exports = { auth, requireRole, allowRoles };
