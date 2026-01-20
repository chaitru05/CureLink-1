import mongoose from "mongoose";

const PlatformActivitySchema = new mongoose.Schema({
  action: {
    type: String,
    required: true
  }, // "Patient Registered", "Appointment Created", "Appointment Completed", etc.
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "targetType"
  },
  targetType: {
    type: String,
    enum: ["User", "Appointment", "MedicalRecord", "System"],
    default: "System"
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
PlatformActivitySchema.index({ createdAt: -1 });
PlatformActivitySchema.index({ action: 1 });
PlatformActivitySchema.index({ userId: 1 });

export default mongoose.model("PlatformActivity", PlatformActivitySchema)
