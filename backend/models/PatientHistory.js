import mongoose from "mongoose"

const PatientHistorySchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  allergies: [String],
  pastIllnesses: [String],
  ongoingMedications: [String],
  surgeries: [String]

}, { timestamps: true });
export default mongoose.model("PatientHistory", PatientHistorySchema)