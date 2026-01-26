import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import reminderRoutes from "./routes/reminder.routes.js";
import calendarRoutes from "./routes/calendar.routes.js";
import authRoutes from "./routes/auth.routes.js";
import doctorRoutes from "./routes/doctor.routes.js";
import appointmentRoutes from "./routes/appointment.routes.js";
import medicalRecordRoutes from "./routes/medicalRecord.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const app = express();

/* =======================
   CORS CONFIG (MUST BE FIRST)
======================= */

const allowedOrigins = [
  "http://localhost:3000",
  "https://cure-link-1.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    // allow server-to-server, Postman, curl
    if (!origin) return callback(null, true);

    // allow exact origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // allow ALL Vercel preview deployments
    if (origin.endsWith(".vercel.app")) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ Explicit preflight handling
app.options("*", cors());

/* =======================
   MIDDLEWARES
======================= */

app.use(express.json());
app.use(cookieParser());

/* =======================
   ROUTES
======================= */

app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/medical-records", medicalRecordRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/calendar", calendarRoutes);

export default app;
