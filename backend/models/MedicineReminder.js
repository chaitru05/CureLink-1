import mongoose from "mongoose"

const MedicineReminderSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  medicineName: String,
  dosage: String,

  reminderDate: Date,
  reminderTime: String,

  isTaken: { type: Boolean, default: false }
}, { timestamps: true })

export default mongoose.model("MedicineReminder", MedicineReminderSchema)