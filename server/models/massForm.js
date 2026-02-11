import mongoose from "mongoose";

const MassFormSchema = new mongoose.Schema({
  
    user:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"user",
      required:true
    },
 
  massType: {
    type: String,
    required: true,
    enum: [
      "THANKSGIVING",
      "SOULOF",
      "MONTHMIND",
      "DEATHANNIVERSARY",
      "BIRTHDAY",
      "WEDDINGANNIVERSARY",
      "INTENTIONS",
      "GOODHEALTH",
    ]
  },

  
  offerForName: { type: String, required: true },
  offerByName: { type: String, required: true },
  email: { type: String },
  preferedDate: { type: Date, required: true },
  preferedTime: { type: String, required: true },

  
  yearOfMarriage: { type: String },        // wedding anniversary
  dob:{type:Date},
  age: { type: Number },                   // birthday
  relationToDeceased: { type: String },    // month mind
  yearSinceDeath: { type: String },        // death anniversary
  dateOfDeath: { type: Date },              // death anniversary


  status:{
    type:String,
    enum:["pending","approved","rejected"],
    default:"pending"
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

  adminRemark:{
    type:String,
    default:""
  }


}, { timestamps: true });
const massModel=mongoose.model("MassBooking", MassFormSchema);
export default massModel
