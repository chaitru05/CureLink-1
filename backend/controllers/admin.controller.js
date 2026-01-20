import bcrypt from "bcryptjs"
import User from "../models/User.js"
import Appointment from "../models/Appointment.js"
import AdminLog from "../models/AdminLog.js"
import PlatformActivity from "../models/PlatformActivity.js"

// ==================== USER MANAGEMENT ====================

// GET ALL USERS
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password")
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// DELETE USER
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    await User.findByIdAndDelete(req.params.id)

    // Log the action
    await AdminLog.create({
      adminId: req.user.id,
      action: "Deleted User",
      targetId: req.params.id,
      description: `Deleted user: ${user.name} (${user.email})`
    })

    res.json({ message: "User deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ==================== DOCTOR MANAGEMENT ====================

// GET ALL DOCTORS
export const getDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: "doctor" })
      .select("-password")
      .sort({ createdAt: -1 })

    // Get appointment counts for each doctor
    const doctorsWithStats = await Promise.all(
      doctors.map(async (doctor) => {
        const appointmentCount = await Appointment.countDocuments({ doctorId: doctor._id })
        const patientCount = await Appointment.distinct("patientId", { doctorId: doctor._id })
        
        return {
          ...doctor.toObject(),
          appointmentCount,
          patientCount: patientCount.length
        }
      })
    )

    res.json(doctorsWithStats)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// GET SINGLE DOCTOR
export const getDoctor = async (req, res) => {
  try {
    const doctor = await User.findOne({ _id: req.params.id, role: "doctor" })
      .select("-password")

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" })
    }

    const appointmentCount = await Appointment.countDocuments({ doctorId: doctor._id })
    const patientCount = await Appointment.distinct("patientId", { doctorId: doctor._id })

    res.json({
      ...doctor.toObject(),
      appointmentCount,
      patientCount: patientCount.length
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// CREATE DOCTOR
export const createDoctor = async (req, res) => {
  try {
    const { name, email, password, specialization, experience } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    const doctor = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "doctor",
      specialization,
      experience: Number(experience)
    })

    // Log the action
    await AdminLog.create({
      adminId: req.user.id,
      action: "Created Doctor",
      targetId: doctor._id,
      targetType: "Doctor",
      description: `Created doctor profile: ${doctor.name} (${doctor.email})`
    })

    const doctorResponse = doctor.toObject()
    delete doctorResponse.password

    res.status(201).json(doctorResponse)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// UPDATE DOCTOR
export const updateDoctor = async (req, res) => {
  try {
    const { name, email, specialization, experience } = req.body

    const doctor = await User.findOne({ _id: req.params.id, role: "doctor" })
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" })
    }

    // Update fields
    if (name) doctor.name = name
    if (email) doctor.email = email
    if (specialization) doctor.specialization = specialization
    if (experience !== undefined) doctor.experience = Number(experience)

    await doctor.save()

    // Log the action
    await AdminLog.create({
      adminId: req.user.id,
      action: "Updated Doctor",
      targetId: doctor._id,
      targetType: "Doctor",
      description: `Updated doctor profile: ${doctor.name}`
    })

    const doctorResponse = doctor.toObject()
    delete doctorResponse.password

    res.json(doctorResponse)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// DELETE DOCTOR
export const deleteDoctor = async (req, res) => {
  try {
    const doctor = await User.findOne({ _id: req.params.id, role: "doctor" })
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" })
    }

    await User.findByIdAndDelete(req.params.id)

    // Log the action
    await AdminLog.create({
      adminId: req.user.id,
      action: "Deleted Doctor",
      targetId: req.params.id,
      description: `Deleted doctor: ${doctor.name} (${doctor.email})`
    })

    res.json({ message: "Doctor deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ==================== APPOINTMENT MANAGEMENT ====================

// VIEW ALL APPOINTMENTS
export const getAllAppointments = async (req, res) => {
  try {
    const { status, doctorId, patientId } = req.query
    const filter = {}

    if (status) filter.status = status
    if (doctorId) filter.doctorId = doctorId
    if (patientId) filter.patientId = patientId

    const appointments = await Appointment.find(filter)
      .populate("doctorId", "name email specialization")
      .populate("patientId", "name email")
      .sort({ appointmentDate: -1, createdAt: -1 })

    res.json(appointments)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// GET SINGLE APPOINTMENT
export const getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("doctorId", "name email specialization")
      .populate("patientId", "name email")

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" })
    }

    res.json(appointment)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// UPDATE APPOINTMENT STATUS
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body
    const validStatuses = ["pending", "confirmed", "completed", "cancelled"]

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" })
    }

    const appointment = await Appointment.findById(req.params.id)
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" })
    }

    appointment.status = status
    await appointment.save()

    // Log the action
    await AdminLog.create({
      adminId: req.user.id,
      action: "Updated Appointment Status",
      targetId: appointment._id,
      targetType: "Appointment",
      description: `Changed appointment status to: ${status}`
    })

    res.json(appointment)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// CANCEL APPOINTMENT
export const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" })
    }

    appointment.status = "cancelled"
    await appointment.save()

    // Log the action
    await AdminLog.create({
      adminId: req.user.id,
      action: "Cancelled Appointment",
      targetId: appointment._id,
      targetType: "Appointment",
      description: `Cancelled appointment`
    })

    res.json({ message: "Appointment cancelled successfully", appointment })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ==================== PLATFORM ACTIVITY & STATISTICS ====================

// GET PLATFORM STATISTICS
export const getPlatformStats = async (req, res) => {
  try {
    const totalDoctors = await User.countDocuments({ role: "doctor" })
    const totalPatients = await User.countDocuments({ role: "patient" })
    const totalAppointments = await Appointment.countDocuments()
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const appointmentsToday = await Appointment.countDocuments({
      appointmentDate: { $gte: today }
    })

    const pendingAppointments = await Appointment.countDocuments({ status: "pending" })
    const completedAppointments = await Appointment.countDocuments({ status: "completed" })
    const cancelledAppointments = await Appointment.countDocuments({ status: "cancelled" })

    res.json({
      totalDoctors,
      totalPatients,
      totalAppointments,
      appointmentsToday,
      pendingAppointments,
      completedAppointments,
      cancelledAppointments
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// GET ADMIN LOGS (Admin Activity)
export const getAdminLogs = async (req, res) => {
  try {
    const { limit = 50 } = req.query
    const logs = await AdminLog.find()
      .populate("adminId", "name email")
      .sort({ createdAt: -1 })
      .limit(Number(limit))

    res.json(logs)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// GET PLATFORM ACTIVITIES (All Platform Activity)
export const getPlatformActivities = async (req, res) => {
  try {
    const { limit = 100 } = req.query
    const activities = await PlatformActivity.find()
      .populate("userId", "name email role")
      .sort({ createdAt: -1 })
      .limit(Number(limit))

    res.json(activities)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// GET ALL ACTIVITIES (Both Admin and Platform)
export const getAllActivities = async (req, res) => {
  try {
    const { limit = 100 } = req.query
    
    const [adminLogs, platformActivities] = await Promise.all([
      AdminLog.find()
        .populate("adminId", "name email")
        .sort({ createdAt: -1 })
        .limit(Number(limit)),
      PlatformActivity.find()
        .populate("userId", "name email role")
        .sort({ createdAt: -1 })
        .limit(Number(limit))
    ])

    res.json({
      adminLogs,
      platformActivities
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
