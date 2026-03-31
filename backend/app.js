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
   CORS CONFIG (FIRST)
======================= */

const allowedOrigins = [
  "http://localhost:3000",
  // "https://cure-link-1.vercel.app",          // Vercel (commented — keeping for reference)
  process.env.CLOUDFRONT_URL,                    // e.g. https://d1234abcdef.cloudfront.net
  process.env.S3_WEBSITE_URL                     // e.g. http://curelink-frontend.s3-website.ap-south-1.amazonaws.com
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    console.log("🌍 CORS ORIGIN:", origin);

    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // if (origin.endsWith(".vercel.app")) {      // Vercel (commented — keeping for reference)
    //   return callback(null, true);
    // }

    if (origin.endsWith(".cloudfront.net") || origin.endsWith(".amazonaws.com")) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));

/* =======================
   MIDDLEWARES
======================= */

app.use(express.json());
app.use(cookieParser());

/* =======================
   HEALTH CHECK (for EC2 / API Gateway / CloudWatch)
======================= */

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

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
