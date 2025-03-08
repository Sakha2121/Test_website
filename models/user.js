const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  // Common fields for all users
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["student", "institute"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

  // Student-specific fields
  college: {
    type: String,
    validate: {
      validator: function () {
        return this.role !== "institute"; // Required for students
      },
      message: "College is required for students.",
    },
  },
  interests: [
    {
      type: String,
    },
  ],
  examsInterested: [
    {
      type: String,
    },
  ],

  // Institute-specific fields
  instituteName: {
    type: String,
    validate: {
      validator: function () {
        return this.role !== "student"; // Required for institutes
      },
      message: "Institute Name is required for institutes.",
    },
  },
  address: {
    type: String,
  },
  contactNumber: {
    type: String,
  },
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
  description: {
    type: String,
  },
  establishedYear: {
    type: Number,
  },
  website: {
    type: String,
  },
  socialMedia: {
    type: Object,
    default: {}, // Ensures it doesn't return undefined
  },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    console.log("Hashing password for", this.email); // Debugging line
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
