import mongoose from "mongoose"

const AppointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  appointmentDate: Date,
  timeSlot: String,
  consultationType: String,
  reasonForVisit: String,
  status: {
    type: String,
    enum: ["pending", "confirmed", "completed", "cancelled"],
    default: "confirmed"
  }
}, { timestamps: true })

AppointmentSchema.index(
  { doctorId: 1, appointmentDate: 1, timeSlot: 1 },
  { unique: true }
)

export default mongoose.model("Appointment", AppointmentSchema)
