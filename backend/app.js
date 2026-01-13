import express from "express"
import cors from "cors"


import authRoutes from "./routes/auth.routes.js"
import doctorRoutes from "./routes/doctor.routes.js"
import appointmentRoutes from "./routes/appointment.routes.js"
import medicalRecordRoutes from "./routes/medicalRecord.routes.js"
import notificationRoutes from "./routes/notification.routes.js"
import adminRoutes from "./routes/admin.routes.js"


const app = express()


app.use(cors())
app.use(express.json())


app.use("/api/auth", authRoutes)
app.use("/api/doctors", doctorRoutes)
app.use("/api/appointments", appointmentRoutes)
app.use("/api/medical-records", medicalRecordRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/admin", adminRoutes)


export default app