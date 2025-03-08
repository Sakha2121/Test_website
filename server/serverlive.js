const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const pakagesRoutes = require("../routes/pakages");
const getAllDataRoutes = require("../routes/getAllData");

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

// Routes
console.log("Setting up routes...");
app.use("/pakages", pakagesRoutes);
app.use("/all-data", getAllDataRoutes);
console.log("Routes initialized: /pakages and /all-data");

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Handle uncaught exceptions and rejections
process.on("uncaughtException", (err) => {
  console.error("Unhandled Exception:", err.message);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at Promise:", promise, "reason:", reason);
});
