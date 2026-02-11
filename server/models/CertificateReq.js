import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true
  },

  certificateType: {
    type: String,
    required: true,
    enum: ["MARRIAGE", "BAPTISM"]
  },

 


  requesterName: {
    type: String,
    required: true
  },

  requesterRelation: {
    type: String,
    required: true
  },



  
  dateOfBaptism: { type: Date },
  fatherName: { type: String },
  motherName: { type: String },

  
  groomsName: { type: String },


  bridesName: { type: String },


  dateOfMarriage: { type: Date },
  marriageRegNo: { type: Number },

  expirationDate: { type: Date },

status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },

  remark: {
    type: String,
    default: ""
  },

  paymentStatus: {
    type: String,
    enum: ["notRequired" ,"pending", "paid"],
    default: "notRequired"
  },

  paymentId:{
    type:String
  },
  paidAt:{
    type:Date
  },
    certificatePdf: {
    type: String,
    default:"" 
  },
    deliveredAt: {
    type: Date
  }
}, { timestamps: true });

const certificateModel = mongoose.model("Certificate", certificateSchema);
export default certificateModel;
