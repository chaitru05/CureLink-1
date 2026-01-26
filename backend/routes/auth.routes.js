import express from "express";
import { register, login, getProfile, logout } from "../controllers/auth.controller.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect, getProfile); // renamed from /me (clearer)
router.post("/logout", logout);              // ✅ LOGOUT

export default router;
