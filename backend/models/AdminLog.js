import mongoose from "mongoose";

const AdminLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  action: String, // "Deleted Doctor", "Cancelled Appointment"

  targetId: mongoose.Schema.Types.ObjectId,

  description: String

}, { timestamps: true });

export default mongoose.model("AdminLog", AdminLogSchema)
