# AWS Deployment — Code Changes Walkthrough

## Changes Made

### 1. [backend/app.js](file:///d:/Chaitrali/CureLink3/backend/app.js) — CORS + Health Check
```diff:app.js
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
  "https://cure-link-1.vercel.app"
];

const corsOptions = {
  origin: function (origin, callback) {
    console.log("🌍 CORS ORIGIN:", origin);

    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    if (origin.endsWith(".vercel.app")) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions)); // ✅ THIS IS ENOUGH

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
===
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

// ✅ Explicit preflight handler — ensures OPTIONS requests always succeed
app.options("*", cors(corsOptions));

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
```

- CORS now reads `CLOUDFRONT_URL` and `S3_WEBSITE_URL` from env vars
- Vercel references **commented out** (not removed)
- Dynamic check accepts `.cloudfront.net` and `.amazonaws.com` domains
- Added `/health` endpoint for EC2 monitoring / API Gateway health checks

### 2. [backend/server.js](file:///d:/Chaitrali/CureLink3/backend/server.js) — PORT Fallback
```diff:server.js
import app from "./app.js"
import connectDB from "./config/db.js" 
import dotenv from "dotenv" 

dotenv.config() 
connectDB() 

app.listen(process.env.PORT, () => { 
  console.log(`Server running on port ${process.env.PORT}`) 
})
===
import app from "./app.js"
import connectDB from "./config/db.js" 
import dotenv from "dotenv" 

dotenv.config() 
connectDB() 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => { 
  console.log(`Server running on port ${PORT}`) 
})
```

PORT defaults to `5000` if env var missing (EC2 doesn't auto-inject like Railway)

### 3. [backend/.env](file:///d:/Chaitrali/CureLink3/backend/.env) — New AWS Variables
- Added `CLOUDFRONT_URL`, `S3_WEBSITE_URL`, `NODE_ENV` placeholders

### 4. [frontend/.env](file:///d:/Chaitrali/CureLink3/frontend/.env) — API Gateway URL
- Railway URL commented out, placeholder for API Gateway URL added

### 5. [backend/ecosystem.config.cjs](file:///d:/Chaitrali/CureLink3/backend/ecosystem.config.cjs) — PM2 Config (NEW)
- Keeps backend alive on EC2 after SSH disconnect or crash

## Verification

| Check | Result |
|-------|--------|
| Frontend build (`npm run build`) | ✅ Built in 4.38s, 484 modules |
| `dist/` output | ✅ [index.html](file:///d:/Chaitrali/CureLink3/frontend/index.html) + `assets/` + images |
| [app.js](file:///d:/Chaitrali/CureLink3/backend/app.js) CORS config | ✅ CloudFront/S3 origins, Vercel commented |
| Health endpoint | ✅ `GET /health` returns `{"status":"ok"}` |
| PM2 config | ✅ Created at [ecosystem.config.cjs](file:///d:/Chaitrali/CureLink3/backend/ecosystem.config.cjs) |

## Your Next Steps (AWS Setup)

1. **Create S3 bucket** → Upload contents of `frontend/dist/` → Enable static website hosting
2. **Create CloudFront distribution** → Point origin to S3 bucket → Get CloudFront URL
3. **Launch EC2 t2.micro** → Install Node.js + PM2 → Clone repo → `npm install` in backend → `pm2 start ecosystem.config.cjs`
4. **Create API Gateway** → HTTP API → Add route `ANY /{proxy+}` → Integration target: `http://EC2_PRIVATE_IP:5000`
5. **Update env vars** with actual URLs:
   - `backend/.env`: Set `CLOUDFRONT_URL` and `S3_WEBSITE_URL`
   - `frontend/.env`: Set `VITE_API_URL` to API Gateway URL → Rebuild → Re-upload `dist/` to S3
6. **MongoDB Atlas** → Whitelist EC2's public IP in Network Access
7. **Firebase Console** → Add CloudFront domain to Authorized Domains
