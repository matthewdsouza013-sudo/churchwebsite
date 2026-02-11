import bcrypt from 'bcryptjs';

import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';

// Password validation function
const validatePassword = (password) => {
  // Password must contain:
  // - At least 8 characters
  // - At least one uppercase letter
  // - At least one lowercase letter
  // - At least one digit
  // - At least one special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

//reset
export const register=async (req,res)=>{
    const {name,email,password,address}=req.body;
    if(!name || !email || !password || !address){
        return res.json({success: false, message:'Missing details'})
    }
    
    // Validate password strength
    if (!validatePassword(password)) {
      return res.json({
        success: false,
        message: 'Password must be at least 8 characters with uppercase letter, lowercase letter, number, and special character (@$!%*?&)'
      });
    }
    
    try {
        const userCheck=await userModel.findOne({email});
        if(userCheck){
            return res.json({success:false,message:"user already exists"});
        }
        const hashedPassword=await bcrypt.hash(password, 10);
        const user =new userModel({name, email , password:hashedPassword,address});
        await user.save();

        const token =jwt.sign(
            {id: user._id},
            process.env.JWT_SECRET, 
            {expiresIn:"7d"}
        );
        res.cookie("token",token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        const mailOptions = {
  from: process.env.SENDER_EMAIL,
  to: email,
  subject: "Welcome to Our Lady of the Poor Church 🙏",
  html: `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
  </head>

  <body style="margin:0; padding:0; background-color:#eef2f7; font-family: Georgia, 'Times New Roman', serif;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:30px 15px;">

          <table width="600" cellpadding="0" cellspacing="0"
            style="background:#ffffff; border-radius:10px; overflow:hidden;
                   box-shadow:0 4px 12px rgba(0,0,0,0.08);">

            <!-- Header -->
            <tr>
              <td style="background:#1e3a8a; color:#ffffff; padding:28px; text-align:center;">
                <div style="font-size:28px; margin-bottom:10px;">✝</div>
                <h1 style="margin:0; font-size:24px; font-weight:normal;">
                  Our Lady of the Poor Church
                </h1>
                <p style="margin:8px 0 0; font-size:14px; opacity:0.9;">
                  “Pray for us”
                </p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:35px 40px; color:#333;">
                <p style="font-size:16px; margin-top:0;">
                  Dear <strong>${name}</strong>,
                </p>

                <p style="font-size:15px; line-height:1.7;">
                  We warmly welcome you to the <strong>Our Lady of the Poor Church</strong> community.
                  Your account has been successfully created with the following email address:
                </p>

                <p style="background:#f8fafc; border-left:4px solid #1e3a8a;
                          padding:12px 15px; font-size:15px; border-radius:4px;">
                  📧 <strong>${email}</strong>
                </p>

                <p style="font-size:15px; line-height:1.7;">
                  You may now log in to access church services, bookings, and announcements.
                  May God’s grace and Our Lady’s intercession guide you always.
                </p>


                <p style="font-size:14px; color:#555; line-height:1.6;">
                  If you did not request this account, please disregard this message.
                </p>

                <p style="font-size:14px; margin-top:25px;">
                  With prayers and blessings,<br/>
                  <strong>Our Lady of the Poor Church</strong>
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f1f5f9; padding:18px; text-align:center;
                         font-size:12px; color:#666;">
                © ${new Date().getFullYear()} Our Lady of the Poor Church<br/>
                All rights reserved
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>
  </body>
  </html>
  `
};


        await transporter.sendMail(mailOptions);
        return res.json({success: true});

    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({
      success: false,
      message: "email and password are required"
    });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "user Not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "invalid password" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "60m" }
    );

    
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,       
      sameSite: "lax",    
      maxAge: 60 * 60 * 1000
    });

    return res.json({ success: true });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const logout =async(req,res)=>{
    try {
        res.clearCookie('token',{
             httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    

        })
        return res.json({success: true ,message :"Logged Out"})
    } catch (error) {
        return res.json({success: false , message: error.message});
    }
}

export const sendVerifyOtp = async (req, res) => {
  try {
    const userId = req.user.userId;   
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "user not found" });
    }

    if (user.isVerified) {
      return res.json({ success: false, message: "account already verified" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

const mailOption = {
  from: process.env.SENDER_EMAIL,
  to: user.email,
  subject: "Account Verification – One Time Password 🙏",
  html: `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
  </head>

  <body style="margin:0; padding:0; background-color:#eef2f7;
               font-family: Georgia, 'Times New Roman', serif;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:30px 15px;">

          <table width="600" cellpadding="0" cellspacing="0"
            style="background:#ffffff; border-radius:10px; overflow:hidden;
                   box-shadow:0 4px 12px rgba(0,0,0,0.08);">

            <!-- Header -->
            <tr>
              <td style="background:#1e3a8a; color:#ffffff;
                         padding:26px; text-align:center;">
                <div style="font-size:26px; margin-bottom:8px;">✝</div>
                <h1 style="margin:0; font-size:22px; font-weight:normal;">
                  Our Lady of the Poor Church
                </h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:35px 40px; color:#333;">
                <p style="font-size:16px; margin-top:0;">
                  Dear <strong>${user.name || "Faithful Member"}</strong>,
                </p>

                <p style="font-size:15px; line-height:1.7;">
                  To verify your account, please use the following
                  <strong>One Time Password (OTP)</strong>.
                </p>

                <!-- OTP Box -->
                <div style="margin:25px 0; text-align:center;">
                  <div style="display:inline-block;
                              padding:16px 28px;
                              font-size:24px;
                              letter-spacing:6px;
                              font-weight:bold;
                              color:#1e3a8a;
                              background:#f8fafc;
                              border:1px dashed #1e3a8a;
                              border-radius:8px;">
                    ${otp}
                  </div>
                </div>

                <p style="font-size:15px; line-height:1.7;">
                  This OTP is valid for a short time.  
                  Please do not share it with anyone.
                </p>

                <p style="font-size:14px; color:#555; line-height:1.6;">
                  If you did not request this verification, you may safely ignore
                  this email.
                </p>

                <p style="font-size:14px; margin-top:25px;">
                  With prayers and blessings,<br/>
                  <strong>Our Lady of the Poor Church</strong>
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f1f5f9; padding:16px;
                         text-align:center; font-size:12px; color:#666;">
                © ${new Date().getFullYear()} Our Lady of the Poor Church
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>
  </body>
  </html>
  `
};


    await transporter.sendMail(mailOption);

    return res.json({ success: true, message: "verification OTP sent" });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  const { otp } = req.body;                 
  const userId = req.user.userId;           

  if (!userId || !otp) {
    return res.json({ success: false, message: "missing details" });
  }

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "user not found" });
    }

    if (user.verifyOtp === "" || user.verifyOtp !== otp) {
      return res.json({ success: false, message: "invalid OTP" });
    }

    if (user.verifyOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP expired" });
    }

    user.isVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;
    await user.save();

    return res.json({ success: true, message: "email verified successfully" });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const isAuthenticated=async (req,res)=>{
    try {
        return res.json({ success: true});
    } catch (error) {
        return res.json({success:false, message: error.message});
    }
};

export const sendResetOtp=async (req,res)=>{
  const {email}=req.body;
  if(!email){
     return res.json({success:false, message: "Email is required"});
  }
     try {
      const user = await userModel.findOne({email});
      if(!user){
        return res.json({success:false, message: "user not found"});
      }
      
      const otp=String(Math.floor(100000+Math.random()*900000));
      user.resetOtp=otp;
      user.resetOtpExpireAt=Date.now()+15*60*1000
      await user.save();
const mailOption = {
  from: process.env.SENDER_EMAIL,
  to: user.email,
  subject: "Password Reset – One Time Password 🙏",
  html: `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
  </head>

  <body style="margin:0; padding:0; background-color:#eef2f7;
               font-family: Georgia, 'Times New Roman', serif;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:30px 15px;">

          <table width="600" cellpadding="0" cellspacing="0"
            style="background:#ffffff; border-radius:10px; overflow:hidden;
                   box-shadow:0 4px 12px rgba(0,0,0,0.08);">

            <!-- Header -->
            <tr>
              <td style="background:#1e3a8a; color:#ffffff;
                         padding:26px; text-align:center;">
                <div style="font-size:26px; margin-bottom:8px;">✝</div>
                <h1 style="margin:0; font-size:22px; font-weight:normal;">
                  Our Lady of the Poor Church
                </h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:35px 40px; color:#333;">
                <p style="font-size:16px; margin-top:0;">
                  Dear <strong>${user.name || "Faithful Member"}</strong>,
                </p>

                <p style="font-size:15px; line-height:1.7;">
                  We received a request to reset your account password.
                  Please use the following <strong>One Time Password (OTP)</strong>
                  to proceed.
                </p>

                <!-- OTP Box -->
                <div style="margin:25px 0; text-align:center;">
                  <div style="display:inline-block;
                              padding:16px 28px;
                              font-size:24px;
                              letter-spacing:6px;
                              font-weight:bold;
                              color:#1e3a8a;
                              background:#f8fafc;
                              border:1px dashed #1e3a8a;
                              border-radius:8px;">
                    ${otp}
                  </div>
                </div>

                <p style="font-size:15px; line-height:1.7;">
                  This OTP is valid for a limited time.  
                  For your security, please do not share it with anyone.
                </p>

                <p style="font-size:14px; color:#555; line-height:1.6;">
                  If you did not request a password reset, you may safely ignore
                  this message. Your account will remain secure.
                </p>

                <p style="font-size:14px; margin-top:25px;">
                  With prayers and blessings,<br/>
                  <strong>Our Lady of the Poor Church</strong>
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f1f5f9; padding:16px;
                         text-align:center; font-size:12px; color:#666;">
                © ${new Date().getFullYear()} Our Lady of the Poor Church
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>
  </body>
  </html>
  `
};

      await transporter.sendMail(mailOption);
      return res.json({success: true,message:"OTP sent to your email"});
      
     } catch (error) {
      return res.json({success:false, message: error.message});
     }
  
}

export const resetPassword=async(req,res)=>{
  const {email, otp ,newPassword}=req.body;
  if(!email || !otp || !newPassword){
    return res.json({ success: false , message: "email,OTP and new password are required"});

  }
  try {
    const user = await userModel.findOne({email});
    if(!user){
      return res.json({success:false, message: "user not found"});

    }
    if(user.resetOtp==="" || user.resetOtp !== otp){
      return res.json({success:false, message: "invalid OTP"});
    }
    if(user.resetOtpExpireAt< Date.now()){
      return res.json({success:false, message: "OTP expired"});
    }
    const hashedPassword = await bcrypt.hash(newPassword,10);
    user.password =hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt=0;
    await user.save();
    return res.json({success:true, message: "Password has been reset successfully"});

  } catch (error) {
    return res.json({success:false, message: error.message});
  }
}


// export const getUserData = async (req, res) => {
//   try {
//     const userId = req.user.userId;        

//     const user = await userModel.findById(userId);
//     if (!user) {
//       return res.json({
//         success: false,
//         message: "User not found"
//       });
//     }

//     return res.json({
//       success: true,
//       userData: {
//         name: user.name,
//         email: user.email,
//         isVerified: user.isVerified,
//         address:user.address
//       }
//     });

//   } catch (error) {
//     return res.json({ success: false, message: error.message });
//   }
// };
