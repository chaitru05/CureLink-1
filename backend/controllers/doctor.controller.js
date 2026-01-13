import User from "../models/User.js"

// GET ALL DOCTORS
export const getDoctors = async (req, res) => {
  const doctors = await User.find({ role: "doctor" }).select("-password")
  res.json(doctors)
}

// UPDATE AVAILABILITY (Doctor only)
export const updateAvailability = async (req, res) => {
  const doctor = await User.findById(req.user.id)

  doctor.availability = req.body.availability
  await doctor.save()

  res.json({ message: "Availability updated successfully" })
}

// GET DOCTOR AVAILABILITY
export const getAvailability = async (req, res) => {
  const doctor = await User.findById(req.params.id)
  res.json(doctor.availability)
}
