import MedicalRecord from "../models/MedicalRecord.js"

// ADD MEDICAL RECORD (Doctor)
export const addMedicalRecord = async (req, res) => {
  const record = await MedicalRecord.create({
    ...req.body,
    doctorId: req.user.id
  })

  res.status(201).json(record)
}

// GET PATIENT MEDICAL HISTORY
export const getPatientRecords = async (req, res) => {
  const records = await MedicalRecord.find({
    patientId: req.params.patientId
  }).populate("doctorId", "name specialization")

  res.json(records)
}

// GET RECORD BY APPOINTMENT
export const getRecordByAppointment = async (req, res) => {
  const record = await MedicalRecord.findOne({
    appointmentId: req.params.appointmentId
  })

  res.json(record)
}
