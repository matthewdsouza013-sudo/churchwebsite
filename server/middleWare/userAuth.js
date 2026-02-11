import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.json({ success: false, message: "not authorized Log in again" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id) {
      return res.json({ success: false, message: "not authorized Log in again" });
    }

    const user = await userModel.findById(decoded.id).select("isVerified role");

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    req.user = {
      userId: user._id,
      isVerified: user.isVerified,
      role: user.role,
    };

    next();
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export default userAuth;
