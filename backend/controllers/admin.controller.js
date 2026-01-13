import User from "../models/User.js"
import Appointment from "../models/Appointment.js"

// GET ALL USERS
export const getUsers = async (req, res) => {
  const users = await User.find().select("-password")
  res.json(users)
}

// DELETE USER
export const deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id)
  res.json({ message: "User deleted" })
}

// VIEW ALL APPOINTMENTS
export const getAllAppointments = async (req, res) => {
  const appointments = await Appointment.find()
    .populate("doctorId", "name")
    .populate("patientId", "name")

  res.json(appointments)
}
