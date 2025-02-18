const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const pakageSchema = new mongoose.Schema({}, { strict: false });
const PakageModel = mongoose.model("Pakage", pakageSchema, "pakages");

router.get("/", async (req, res) => {
  try {
    const { L1, L2, L3, Coaching_type, Coaching_ID } = req.query;

    // Check for mandatory fields
    const mandatoryFields = {
      L1_Classification: L1,
      L3_Classification: L3,
      Coaching_type: Coaching_type,
    };

    // Validate mandatory fields
    const missingFields = Object.entries(mandatoryFields)
      .filter(([_, value]) => !value || value.trim() === "")
      .map(([field]) => field);

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: "Missing required fields",
        missingFields: missingFields,
        message: `The following fields are mandatory: ${missingFields.join(
          ", "
        )}`,
      });
    }

    // Build match filter with mandatory fields
    const matchFilter = {
      L1_Classification: L1,
      L3_Classification: L3,
      Coaching_type: Coaching_type,
    };

    // Add optional filters
    if (L2 && L2.trim() !== "") matchFilter.L2_Classification = L2;
    if (Coaching_ID && Coaching_ID.trim() !== "")
      matchFilter.Coaching_ID = Coaching_ID;

    console.log("Applying Filters:", matchFilter);

    const pakages = await PakageModel.aggregate([
      {
        $match: matchFilter,
      },
      {
        $lookup: {
          from: "instituteData",
          localField: "Coaching_ID",
          foreignField: "Coaching_ID",
          as: "instituteDetails",
        },
      },
      {
        $unwind: {
          path: "$instituteDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          L1_Classification: 1,
          L2_Classification: 1,
          L3_Classification: 1,
          Coaching_ID: 1,
          Program_Name: 1,
          Pakage_ID: 1,
          Coaching_type: 1,
          Subjects: 1,
          Subjects2: 1,
          Filter2: 1,
          Fees: 1,
          Lecture_mode: 1,
          "#Mentorship_sessions": 1,
          Weekend_batch: 1,
          "#Full_length_mocks": 1,
          "#Sectional_tests": 1,
          CAT_National_benchmarking: 1,
          CAT_OMETS_access: 1,
          CAT_Profile_SOP_evaluation: 1,
          "#CAT_Mock_interview_online": 1,
          "#CAT_Mock_interview_offline": 1,
          Coaching_Name: "$instituteDetails.Coaching_Name",
          coachinglogo: "$instituteDetails.coachinglogo",
        },
      },
    ]);

    console.log("Filtered Response Count:", pakages.length);

    res.json(pakages);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      error: "Server error",
      message: "Error fetching packages",
      details: error.message,
    });
  }
});

module.exports = router;
