import mongoose from "mongoose";

const AdminLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  action: {
    type: String,
    required: true
  }, // "Created Doctor", "Updated Doctor", "Deleted Doctor", "Cancelled Appointment", etc.
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "targetType"
  },
  targetType: {
    type: String,
    enum: ["User", "Doctor", "Appointment", "System"],
    default: "User"
  },
  description: {
    type: String,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

// Index for faster queries
AdminLogSchema.index({ createdAt: -1 });
AdminLogSchema.index({ adminId: 1 });
AdminLogSchema.index({ action: 1 });

export default mongoose.model("AdminLog", AdminLogSchema)
