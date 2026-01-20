import express from "express"
import {
  // User Management
  getUsers,
  deleteUser,
  // Doctor Management
  getDoctors,
  getDoctor,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  // Appointment Management
  getAllAppointments,
  getAppointment,
  updateAppointmentStatus,
  cancelAppointment,
  // Platform Activity
  getPlatformStats,
  getAdminLogs,
  getPlatformActivities,
  getAllActivities
} from "../controllers/admin.controller.js"

import { protect } from "../middlewares/authMiddleware.js"
import { authorizeRoles } from "../middlewares/roleMiddleware.js"

const router = express.Router()

// Apply admin protection to all routes
router.use(protect)
router.use(authorizeRoles("admin"))

// ==================== USER MANAGEMENT ====================
router.get("/users", getUsers)
router.delete("/user/:id", deleteUser)

// ==================== DOCTOR MANAGEMENT ====================
router.get("/doctors", getDoctors)
router.get("/doctor/:id", getDoctor)
router.post("/doctor", createDoctor)
router.put("/doctor/:id", updateDoctor)
router.delete("/doctor/:id", deleteDoctor)

// ==================== APPOINTMENT MANAGEMENT ====================
router.get("/appointments", getAllAppointments)
router.get("/appointment/:id", getAppointment)
router.put("/appointment/:id/status", updateAppointmentStatus)
router.put("/appointment/:id/cancel", cancelAppointment)

// ==================== PLATFORM ACTIVITY ====================
router.get("/stats", getPlatformStats)
router.get("/logs", getAdminLogs)
router.get("/platform-activities", getPlatformActivities)
router.get("/all-activities", getAllActivities)

export default router
