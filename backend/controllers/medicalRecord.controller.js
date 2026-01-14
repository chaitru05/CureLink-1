import MedicalRecord from "../models/MedicalRecord.js"
import MedicineReminder from "../models/MedicineReminder.js"

export const addMedicalRecord = async (req, res) => {
  const record = await MedicalRecord.create({
    ...req.body,
    doctorId: req.user.id
  })

  // Generate reminders
  for (const med of record.prescriptions) {
    for (let day = 0; day < med.durationInDays; day++) {
      const reminderDate = new Date(med.startDate)
      reminderDate.setDate(reminderDate.getDate() + day)

      for (const t of med.times) {
        await MedicineReminder.create({
          patientId: record.patientId,
          medicineName: med.medicineName,
          dosage: med.dosage,
          reminderDate,
          reminderTime: t.time
        })
      }
    }
  }

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
