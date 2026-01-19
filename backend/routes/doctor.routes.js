import express from "express"
import {
  getDoctors,
  updateAvailability,
  getAvailability
} from "../controllers/doctor.controller.js"

import { protect } from "../middlewares/authMiddleware.js"
import { authorizeRoles } from "../middlewares/roleMiddleware.js"

const router = express.Router()

// Patient & Admin
router.get("/", protect, getDoctors)

// Patient
router.get("/:id/availability", protect, getAvailability)

// Doctor only
router.put(
  "/availability",
  protect,
  authorizeRoles("doctor"),
  updateAvailability
)

// Doctor only – get own availability
router.get(
  "/availability",
  protect,
  authorizeRoles("doctor"),
  getAvailability
)


export default router
