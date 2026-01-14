import express from "express"
import {
  getTodayReminders,
  markAsTaken
} from "../controllers/remainder.controller.js"

import { protect } from "../middlewares/authMiddleware.js"
import { authorizeRoles } from "../middlewares/roleMiddleware.js"

const router = express.Router()

// Get today's medicine reminders (Patient)
router.get(
  "/today",
  protect,
  authorizeRoles("patient"),
  getTodayReminders
)

// Mark medicine as taken (Patient)
router.put(
  "/:id/taken",
  protect,
  authorizeRoles("patient"),
  markAsTaken
)

export default router
