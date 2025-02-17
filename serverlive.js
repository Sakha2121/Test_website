const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const pakagesRoutes = require("./routes/pakages"); // Existing pakages route
const getAllDataRoutes = require("./routes/getAllData"); // New route for all data

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

console.log("Middleware initialized.");

// Connect to MongoDB
console.log("Attempting to connect to MongoDB...");

mongoose.connect(
  "mongodb+srv://sakhaghotekar:G5lK7HnYZ4h0YzpE@knowyourcoaching.fp1oe.mongodb.net/Demo?retryWrites=true&w=majority",
  {
    tls: true,
  }
);

mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB locally and using the Demo database!");
});

mongoose.connection.on("error", (err) => {
  console.error("Error connecting to MongoDB:", err);
});

// Routes
console.log("Setting up routes...");
app.use("/pakages", pakagesRoutes); // Existing pakages route
app.use("/all-data", getAllDataRoutes); // New route for all data
console.log("Routes initialized: /pakages and /all-data");

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Handle uncaught exceptions and rejections
process.on("uncaughtException", (err) => {
  console.error("Unhandled Exception:", err.message);
  process.exit(1); // Exit process to avoid undefined state
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at Promise:", promise, "reason:", reason);
});
