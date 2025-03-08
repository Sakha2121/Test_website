const mongoose = require("mongoose");

const OTPSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 900 }, // OTP expires in 15 mins
});

module.exports = mongoose.model("OTP", OTPSchema);
