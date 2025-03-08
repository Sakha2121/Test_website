const express = require("express");
const router = express.Router();
const OTP = require("../models/otps");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

// Function to generate a 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Route to send OTP via email
router.post("/send", async (req, res) => {
  console.log("Request body:", req.body);
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  // Generate OTP
  const otp = generateOTP();

  try {
    // Hash OTP before storing it
    const hashedOTP = await bcrypt.hash(otp, 10);

    // Delete any existing OTPs for this email
    await OTP.deleteMany({ email });

    // Save hashed OTP to the database
    await OTP.create({ email, otp: hashedOTP });

    // Create a transporter using SMTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "knowyourcoaching@gmail.com", // replace with your email
        pass: "dimw onkz hfep pifa", // replace with your password or app password
      },
    });

    // Email options
    const mailOptions = {
      from: "Verification@knowyourcoaching.in",
      to: email,
      subject: "Your OTP Code",
      text: `The OTP for your email verification is: ${otp}`,
      html: `<p>Your OTP is: <strong>${otp}</strong></p>`,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({
      message: "Failed to send OTP",
      error: error.message,
    });
  }
});

// Route to verify OTP
router.post("/verify", async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  try {
    // Find the stored OTP for this email
    const storedOTPRecord = await OTP.findOne({ email });

    if (!storedOTPRecord) {
      return res.status(400).json({
        message: "OTP not found or expired. Please request a new OTP.",
      });
    }

    // Compare the provided OTP with the hashed one in the database
    const isValid = await bcrypt.compare(otp, storedOTPRecord.otp);

    if (isValid) {
      // Optional: Delete the OTP after successful verification
      await OTP.deleteOne({ email });
      return res.status(200).json({ message: "OTP verified successfully" });
    } else {
      return res.status(400).json({ message: "Invalid OTP" });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res
      .status(500)
      .json({ message: "Error verifying OTP", error: error.message });
  }
});

module.exports = router;
