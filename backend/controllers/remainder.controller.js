import MedicineReminder from "../models/MedicineReminder.js"

export const getTodayReminders = async (req, res) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  const reminders = await MedicineReminder.find({
    patientId: req.user.id,
    reminderDate: { $gte: today, $lt: tomorrow }
  })

  res.json(reminders)
}

export const markAsTaken = async (req, res) => {
  await MedicineReminder.findByIdAndUpdate(req.params.id, { isTaken: true })
  res.json({ message: "Medicine marked as taken" })
}