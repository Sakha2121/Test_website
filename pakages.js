const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// Define schema and model for `pakages` collection
const pakageSchema = new mongoose.Schema({}, { strict: false }); // No strict schema, fetches all fields
const PakageModel = mongoose.model("Pakage", pakageSchema, "pakages");

router.get("/", async (req, res) => {
  try {
    const { L1, L2, Coaching_type, Coaching_ID, Subjects } = req.query;
    const matchFilter = {};

    // **Apply filters only if values are provided**
    // **Apply filters only if values are provided**
    if (L1 && L1.trim() !== "") matchFilter.L1_Classification = L1;
    if (L2 && L2.trim() !== "") matchFilter.L2_Classification = L2;
    if (Coaching_type && Coaching_type.trim() !== "")
      matchFilter.Coaching_type = Coaching_type;
    if (Subjects && Subjects.trim() !== "") matchFilter.Subjects = Subjects;
    if (Coaching_ID && Coaching_ID.trim() !== "")
      matchFilter.Coaching_ID = Coaching_ID; // ✅ Now filters Coaching_ID if provided

    console.log("Applying Filters:", matchFilter); // Debugging to check applied filters

    // **MongoDB Aggregation Pipeline**
    const pakages = await PakageModel.aggregate([
      {
        $match: matchFilter, // Apply filters only if provided
      },
      {
        $lookup: {
          from: "instituteData", // Name of the second collection
          localField: "Coaching_ID", // Field in `pakages` collection
          foreignField: "Coaching_ID", // Field in `instituteData` collection
          as: "instituteDetails", // Alias for joined data
        },
      },
      {
        $unwind: {
          path: "$instituteDetails",
          preserveNullAndEmptyArrays: true, // Preserve data even if there's no match
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
          UPSC_DAF_evaluation: 1,
          UPSC_int_recording: 1,
          UPSC_National_benchmarking: 1,
          Personalised_mentorship_sessions: 1,
          Doubt_solving_sessions: 1,
          EEE_National_benchmarking: 1,
          Subject_topic_wise_tests: 1,
          // **Include Coaching Name & Logo**
          Coaching_Name: "$instituteDetails.Coaching_Name",
          coachinglogo: "$instituteDetails.coachinglogo",
        },
      },
    ]);

    console.log("Filtered Response Count:", pakages.length); // Debugging

    res.json(pakages); // Send filtered data
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Error fetching packages", error });
  }
});

module.exports = router;
