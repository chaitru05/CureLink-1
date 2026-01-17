import express from "express"
import {
  addMedicalRecord,
  getPatientRecords,
  getRecordByAppointment
} from "../controllers/medicalRecord.controller.js"

import { protect } from "../middlewares/authMiddleware.js"
import { authorizeRoles } from "../middlewares/roleMiddleware.js"

const router = express.Router()

// Doctor
router.post(
  "/",
  protect,
  authorizeRoles("doctor"),
  addMedicalRecord
)

// Patient
router.get(
  "/patient",
  protect,
  authorizeRoles("patient"),
  getPatientRecords
)

// Doctor
router.get(
  "/appointment/:appointmentId",
  protect,
  authorizeRoles("doctor"),
  getRecordByAppointment
)

export default router
