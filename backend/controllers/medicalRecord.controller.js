import MedicalRecord from "../models/MedicalRecord.js"
import MedicineReminder from "../models/MedicineReminder.js"

/* ================= ADD MEDICAL RECORD (DOCTOR) ================= */
export const addMedicalRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.create({
      ...req.body,
      doctorId: req.user.id
    })

    /* ===== Generate medicine reminders safely ===== */
    if (Array.isArray(record.prescriptions)) {
      for (const med of record.prescriptions) {

        if (!med.startDate || !med.durationInDays || !Array.isArray(med.times)) {
          continue // skip invalid prescription
        }

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
    }

    res.status(201).json(record)

  } catch (err) {
    console.error("Add medical record error:", err)
    res.status(500).json({ message: "Failed to add medical record" })
  }
}

/* ================= GET PATIENT RECORDS ================= */
export const getPatientRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.find({
      patientId: req.user.id   // ✅ FIXED
    })
      .populate("doctorId", "name specialization")
      .sort({ createdAt: -1 })

    res.json(records)

  } catch (err) {
    console.error("Fetch patient records error:", err)
    res.status(500).json({ message: "Failed to fetch records" })
  }
}

/* ================= GET RECORD BY APPOINTMENT ================= */
export const getRecordByAppointment = async (req, res) => {
  try {
    const record = await MedicalRecord.findOne({
      appointmentId: req.params.appointmentId
    })

    res.json(record)

  } catch (err) {
    console.error("Fetch record by appointment error:", err)
    res.status(500).json({ message: "Failed to fetch record" })
  }
}
