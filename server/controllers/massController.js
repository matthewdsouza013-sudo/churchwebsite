import transporter from "../config/nodemailer.js";
import massModel from "../models/massForm.js";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createMassBooking = async (req, res) => {
  try {
    const { userId, isVerified } = req.user;

    if (!isVerified) {
      return res.status(403).json({
        success: false,
        message: "user not verified",
      });
    }

    const {
      massType,
      offerForName,
      offerByName,
      email,
      preferedDate,
      preferedTime,
      yearOfMarriage,
      dob,
      age,
      relationToDeceased,
      yearSinceDeath,
      dateOfDeath,
    } = req.body;

    if (
      !massType ||
      !offerByName ||
      !offerForName ||
      !preferedDate ||
      !preferedTime
    ) {
      return res.json({
        success: false,
        message: "Missing required fields",
      });
    }

    if (massType === "WEDDINGANNIVERSARY" && !yearOfMarriage) {
      return res.json({
        success: false,
        message: "Year of marriage is required",
      });
    }

    if (massType === "BIRTHDAY" && !age) {
      return res.json({ success: false, message: "Age is required" });
    }

    if (massType === "MONTHMIND" && !relationToDeceased) {
      return res.json({
        success: false,
        message: "Relation to deceased is required",
      });
    }

    if (massType === "DEATHANNIVERSARY" && (!yearSinceDeath || !dateOfDeath)) {
      return res.json({
        success: false,
        message: "Death details are required",
      });
    }

    const booking = await massModel.create({
      user: userId,
      massType,
      offerForName,
      offerByName,
      email,
      preferedDate,
      preferedTime,
      yearOfMarriage,
      dob,
      age,
      relationToDeceased,
      yearSinceDeath,
      dateOfDeath,
    });

    return res.status(201).json({
      success: true,
      message: "Mass booking submitted successfully",
      booking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const massStatus = async (req, res) => {
  try {
    const { userId, isVerified } = req.user;

    if (!isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email to view mass status",
      });
    }

    const masses = await massModel
      .find({ user: userId })
      .select(
        "offerForName massType status adminRemark paymentStatus preferedDate",
      )
      .sort({ createdAt: -1 });

    if (masses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No mass bookings found",
      });
    }

    return res.status(200).json({
      success: true,
      data: masses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch mass status",
      error: error.message,
    });
  }
};

export const adminMassStatus = async (req, res) => {
  try {
    const { role } = req.user;

    if (role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access only",
      });
    }

    const masses = await massModel
      .find()
      .populate("user", "name email")
      .select("offerForName massType status preferedDate user")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: masses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch all mass bookings",
      error: error.message,
    });
  }
};

export const updateMassStatus = async (req, res) => {
  try {
    const { role } = req.user;
    const { massId, status, remark } = req.body;

    if (role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access only",
      });
    }

    if (!massId || !status) {
      return res.status(400).json({
        success: false,
        message: "Mass ID and status are required",
      });
    }

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    if (status === "rejected" && !remark) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const mass = await massModel
      .findById(massId)
      .populate("user", "email name");

    if (!mass) {
      return res.status(404).json({
        success: false,
        message: "Mass booking not found",
      });
    }

    if (mass.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending bookings can be updated",
      });
    }

    // ✅ Update status
    mass.status = status;
    mass.adminRemark = remark || "";

    // ✅ If approved, enable payment
    if (status === "approved") {
      mass.paymentStatus = "pending";
    }

    await mass.save();

    /* ===== EMAIL CONTENT ===== */
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: mass.user.email,
      subject: "Update on Your Mass Request",
      html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#eef2f7;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:30px">
        <table width="600" style="background:#fff;border-radius:10px;box-shadow:0 4px 12px rgba(0,0,0,0.08)">
          <tr>
            <td style="background:#1e3a8a;color:#fff;padding:24px;text-align:center">
              <h2 style="margin:0">Our Lady of the Poor Church</h2>
            </td>
          </tr>
          <tr>
            <td style="padding:30px;color:#333">
              <p>Dear <strong>${mass.user.name}</strong>,</p>

              ${
                status === "approved"
                  ? `
                  <p>Your <strong>Mass request has been approved</strong>.</p>
                  <div style="background:#f0fdf4;padding:12px;border-left:4px solid #16a34a;margin:20px 0">
                    ✅ <strong>Status:</strong> Approved
                  </div>
                  <p>Please log in and complete the payment to proceed.</p>
                `
                  : `
                  <p>Your <strong>Mass request has been rejected</strong>.</p>
                  <div style="background:#fef2f2;padding:12px;border-left:4px solid #dc2626;margin:20px 0">
                    ❌ <strong>Status:</strong> Rejected
                  </div>
                  <p><strong>Reason:</strong> ${remark}</p>
                `
              }

              <p style="margin-top:25px">
                With prayers and blessings,<br/>
                <strong>Our Lady of the Poor Church</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f1f5f9;text-align:center;font-size:12px;color:#666;padding:14px">
              © ${new Date().getFullYear()} Our Lady of the Poor Church
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    };

    // ✅ Email must NOT block admin action
    setImmediate(async () => {
      try {
        await transporter.sendMail(mailOptions);
      } catch (err) {
        console.error("STATUS EMAIL FAILED:", err.message);
      }
    });

    return res.json({
      success: true,
      message: `Mass booking ${status} successfully`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update mass status",
      error: error.message,
    });
  }
};

export const markMassPaid = async (req, res) => {
  try {
    const { userId } = req.user;
    const { massId, paymentId } = req.body;

    if (!massId || !paymentId) {
      return res.status(400).json({
        success: false,
        message: "Mass ID and payment ID required",
      });
    }

    if (!paymentId.startsWith("pi_")) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment ID",
      });
    }

    const mass = await massModel
      .findOne({ _id: massId, user: userId })
      .populate("user", "email name");

    if (!mass) {
      return res.json({
        success: false,
        message: "Mass not found",
      });
    }

    if (mass.status !== "approved") {
      return res.json({
        success: false,
        message: "Payment not allowed yet",
      });
    }

    if (mass.paymentStatus === "paid") {
      return res.json({
        success: false,
        message: "Already paid",
      });
    }

    mass.paymentStatus = "paid";
    mass.paymentId = paymentId;
    mass.paidAt = new Date();

    await mass.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: mass.user.email,
      subject: "Payment Confirmation – Mass Booking",
      html: `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#eef2f7;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:30px">
        <table width="600" style="background:#fff;border-radius:10px;box-shadow:0 4px 12px rgba(0,0,0,0.08)">
          <tr>
            <td style="background:#1e3a8a;color:#fff;padding:24px;text-align:center">
              <h2 style="margin:0">Our Lady of the Poor Church</h2>
            </td>
          </tr>
          <tr>
            <td style="padding:30px;color:#333">
              <p>Dear <strong>${mass.user.name}</strong>,</p>

              <p>Your payment for the mass request has been successfully received.</p>

              <div style="background:#f0fdf4;padding:12px;border-left:4px solid #16a34a;margin:20px 0">
                ✅ <strong>Payment Status:</strong> Completed
              </div>

              <table width="100%" style="background:#f8fafc;padding:10px;border-radius:6px">
                <tr>
                  <td><strong>Payment ID</strong></td>
                  <td>${mass.paymentId}</td>
                </tr>
                <tr>
                  <td><strong>Payment Date</strong></td>
                  <td>${mass.paidAt.toLocaleString()}</td>
                </tr>
              </table>

              <p style="margin-top:20px">
                Your mass is scheduled on ${mass.preferedDate}.
              </p>

              <p>
                With prayers and blessings,<br/>
                <strong>Our Lady of the Poor Church</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f1f5f9;text-align:center;font-size:12px;color:#666;padding:14px">
              © ${new Date().getFullYear()} Our Lady of the Poor Church
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (err) {
      console.error("PAYMENT EMAIL FAILED:", err.message);
    }

    return res.json({
      success: true,
      message: "Payment successful",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createMassPaymentIntent = async (req, res) => {
  console.log("🔥 HIT createMassPaymentIntent");
  try {
    
    const { userId } = req.user;
    const { massId } = req.body;

    
    if (!massId) {
      return res.status(400).json({
        success: false,
        message: "Mass ID required",
      });
    }

    
    console.log("CREATE MASS PAYMENT:", {
      massId,
      userId,
    });

    const mass = await massModel.findOne({
      _id: massId,
      user: userId,
    });
    console.log("DEBUG mass found:", !!mass);
    console.log("DEBUG mass.status:", mass?.status);
    console.log("DEBUG mass.paymentStatus:", mass?.paymentStatus);
    if (!mass) {
      return res.status(404).json({
        success: false,
        message: "Mass booking not found",
      });
    }

    if (mass.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Payment not allowed yet",
      });
    }

    if (mass.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "Mass already paid",
      });
    }

    const amountInPaise = 50000; 

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInPaise,
      currency: "inr",
      metadata: {
        massId: mass._id.toString(),
        userId: userId.toString(),
        purpose: "Mass Payment",
      },
    });

    return res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("STRIPE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// export const createMassPaymentIntent = async (req, res) => {
//   try {
//     const { massId } = req.body;

//     if (!massId) {
//       return res.status(400).json({
//         success: false,
//         message: "Certificate ID required",
//       });
//     }

//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: 50000, // ₹500 in paise
//       currency: "inr",

//       // ✅ ALL metadata values must be strings
//       metadata: {
//         massId: massId.toString(),
//         purpose: "Certificate Payment",
//       },
//     });

//     return res.json({
//       success: true,
//       clientSecret: paymentIntent.client_secret,
//     });
//   } catch (error) {
//     console.error("STRIPE ERROR:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
