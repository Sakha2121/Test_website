const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const pakagesRoutes = require("./routes/pakages");
const getAllDataRoutes = require("./routes/getAllData");
const authRoutes = require("./routes/auth"); // Auth routes
const updateProfileRoutes = require("./routes/updateProfile"); // ✅ Import route
const { auth } = require("./middleware/auth"); // Import auth middleware
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

console.log("Middleware initialized.");

// MongoDB Atlas connection string
const MONGODB_URI =
  "mongodb+srv://sakhaghotekar:G5lK7HnYZ4h0YzpE@knowyourcoaching.fp1oe.mongodb.net/Demo";

// Connect to MongoDB Atlas
console.log("Attempting to connect to MongoDB Atlas...");
mongoose
  .connect(MONGODB_URI, {
    retryWrites: true,
    w: "majority",
  })
  .then(() => {
    console.log("Successfully connected to MongoDB Atlas!");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB Atlas:", error);
    process.exit(1);
  });

// Public routes (no authentication required)
app.use("/auth", authRoutes);
app.use("/OTP", require("./routes/OTP")); //OTP route

// Protected routes (require authentication)
app.use("/pakages", auth, pakagesRoutes);
app.use("/all-data", auth, getAllDataRoutes);
app.use("/updateProfile", updateProfileRoutes); // New route for updating user profile

// Serve static files from the public directory
app.use(express.static("public"));

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


// Handle uncaught exceptions and rejections
process.on("uncaughtException", (err) => {
  console.error("Unhandled Exception:", err.message);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at Promise:", promise, "reason:", reason);
});
