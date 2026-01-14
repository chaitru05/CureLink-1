import mongoose from "mongoose"

const MedicalRecordSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },

  diagnosis: String,
  symptoms: String,

  prescriptions: [
    {
      medicineName: String,
      dosage: String,
      times: [
        { time: String }
      ],
      durationInDays: Number,
      startDate: Date
    }
  ]
}, { timestamps: true })

export default mongoose.model("MedicalRecord", MedicalRecordSchema)