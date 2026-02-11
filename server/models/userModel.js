import mongoose, { Schema } from "mongoose";
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: { type: String, required: true },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  verifyOtp: { type: String, default: "" },
  verifyOtpExpireAt: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  resetOtp: { type: String, default: "" },
  resetOtpExpireAt: { type: Number, default: 0 },
});

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;
