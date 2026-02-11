import userModel from "../models/userModel.js";

export const getUserData = async (req, res) => {
  try {
    const userId = req.user.userId;        

    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({
        success: false,
        message: "User not found"
      });
    }

    return res.json({
      success: true,
      userData: {
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        address:user.address,
        role:user.role
      }
    });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
