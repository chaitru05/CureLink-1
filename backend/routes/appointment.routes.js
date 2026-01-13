import express from "express"
import {
  bookAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  cancelAppointment
} from "../controllers/appointment.controller.js"

import { protect } from "../middlewares/authMiddleware.js"
import { authorizeRoles } from "../middlewares/roleMiddleware.js"

const router = express.Router()

// Patient
router.post(
  "/",
  protect,
  authorizeRoles("patient"),
  bookAppointment
)

router.get(
  "/patient",
  protect,
  authorizeRoles("patient"),
  getPatientAppointments
)

// Doctor
router.get(
  "/doctor",
  protect,
  authorizeRoles("doctor"),
  getDoctorAppointments
)

router.put(
  "/:id/status",
  protect,
  authorizeRoles("doctor"),
  updateAppointmentStatus
)

router.put(
  "/:id/cancel",
  protect,
  authorizeRoles("patient", "doctor"),
  cancelAppointment
)

export default router
