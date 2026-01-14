import express from "express"
import {
  patientCalendar,
  doctorCalendar
} from "../controllers/calendar.controller.js"

import { protect } from "../middlewares/authMiddleware.js"
import { authorizeRoles } from "../middlewares/roleMiddleware.js"

const router = express.Router()

// Patient calendar (appointments + medicines)
router.get(
  "/patient",
  protect,
  authorizeRoles("patient"),
  patientCalendar
)

// Doctor calendar (appointments)
router.get(
  "/doctor",
  protect,
  authorizeRoles("doctor"),
  doctorCalendar
)

export default router
