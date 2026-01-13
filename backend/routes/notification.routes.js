import express from "express"
import {
  getNotifications,
  markAsRead
} from "../controllers/notification.controller.js"

import { protect } from "../middlewares/authMiddleware.js"

const router = express.Router()

router.get("/", protect, getNotifications)
router.put("/:id/read", protect, markAsRead)

export default router
