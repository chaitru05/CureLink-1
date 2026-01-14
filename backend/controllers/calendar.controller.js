import Appointment from "../models/Appointment.js"
import MedicineReminder from "../models/MedicineReminder.js"

export const patientCalendar = async (req, res) => {
  const appointments = await Appointment.find({ patientId: req.user.id })
  const reminders = await MedicineReminder.find({ patientId: req.user.id })

  res.json({ appointments, reminders })
}

export const doctorCalendar = async (req, res) => {
  const appointments = await Appointment.find({ doctorId: req.user.id })
  res.json({ appointments })
}