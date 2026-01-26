import express from "express"
import cors from "cors"

import reminderRoutes from "./routes/reminder.routes.js"
import calendarRoutes from "./routes/calendar.routes.js"
import authRoutes from "./routes/auth.routes.js"
import doctorRoutes from "./routes/doctor.routes.js"
import appointmentRoutes from "./routes/appointment.routes.js"
import medicalRecordRoutes from "./routes/medicalRecord.routes.js"
import notificationRoutes from "./routes/notification.routes.js"
import adminRoutes from "./routes/admin.routes.js"
import cookieParser from "cookie-parser";


const app = express()

const allowedOrigins = [
  "http://localhost:3000",
  "https://https://cure-link-1.vercel.app/"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(express.json())
app.use(cookieParser());

app.use("/api/auth", authRoutes)
app.use("/api/doctors", doctorRoutes)
app.use("/api/appointments", appointmentRoutes)
app.use("/api/medical-records", medicalRecordRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/reminders", reminderRoutes)
app.use("/api/calendar", calendarRoutes)

export default app