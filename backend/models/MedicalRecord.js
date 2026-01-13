import mongoose from "mongoose"

const MedicalRecordSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
    required: true
  },

  symptoms: String,
  diagnosis: String,

  prescriptions: [
    {
      medicineName: String,
      dosage: String,
      duration: String
    }
  ],

  testReports: [
    {
      reportName: String,
      fileUrl: String
    }
  ],

  followUpDate: Date

}, { timestamps: true });

export default mongoose.model("MedicalRecord", MedicalRecordSchema)
