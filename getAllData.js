const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// Define schema and model for `pakages` collection
const pakageSchema = new mongoose.Schema({
  L1_Classification: String,
  L2_Classification: String,
  Program_Name: String,
  Fees: Number,
  Coaching_ID: String,
});

// Use mongoose.models to avoid overwriting
const PakageModel =
  mongoose.models.Pakage || mongoose.model("Pakage", pakageSchema, "pakages");

// Define schema and model for `instituteData` collection
const instituteSchema = new mongoose.Schema({
  Coaching_ID: String,
  Coaching_Name: String,
  coachinglogo: String,
});

const InstituteModel =
  mongoose.models.Institute ||
  mongoose.model("Institute", instituteSchema, "instituteData");

// GET /all-data route
router.get("/", async (req, res) => {
  try {
    // Use MongoDB aggregation pipeline to join pakages and instituteData
    const data = await PakageModel.aggregate([
      {
        $lookup: {
          from: "instituteData", // Name of the second collection
          localField: "Coaching_ID", // Field in pakages collection
          foreignField: "Coaching_ID", // Field in instituteData collection
          as: "instituteDetails", // Alias for joined data
        },
      },
      {
        $unwind: {
          path: "$instituteDetails", // Unwind the array from $lookup
          preserveNullAndEmptyArrays: true, // Allow documents with no match
        },
      },
      {
        $project: {
          L1_Classification: 1,
          L2_Classification: 1,
          Program_Name: 1,
          Fees: 1,
          Coaching_ID: 1,
          Coaching_Name: "$instituteDetails.Coaching_Name", // Include institute name
          coachinglogo: "$instituteDetails.coachinglogo", // Include institute logo
          Institute_Full_Details: "$instituteDetails", // Full institute details
        },
      },
    ]);

    res.send(data); // Send the complete data to the frontend
  } catch (error) {
    console.error("Error fetching all data:", error);
    res.status(500).send({ message: "Error fetching all data", error });
  }
});

module.exports = router;
