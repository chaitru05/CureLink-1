import express from "express"
import {
  getUsers,
  deleteUser,
  getAllAppointments
} from "../controllers/admin.controller.js"

import { protect } from "../middlewares/authMiddleware.js"
import { authorizeRoles } from "../middlewares/roleMiddleware.js"

const router = express.Router()

router.get(
  "/users",
  protect,
  authorizeRoles("admin"),
  getUsers
)

router.delete(
  "/user/:id",
  protect,
  authorizeRoles("admin"),
  deleteUser
)

router.get(
  "/appointments",
  protect,
  authorizeRoles("admin"),
  getAllAppointments
)

export default router
