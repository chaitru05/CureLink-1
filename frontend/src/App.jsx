"use client"

import { Routes, Route, Navigate } from "react-router-dom"

import PatientAuth from "./components/PatientAuth"
import DoctorAuth from "./components/DoctorAuth"
import AdminAuth from "./components/AdminAuth"

import PatientDashboard from "./components/PatientDashboard"
import DoctorDashboard from "./components/DoctorDashboard"
import AdminDashboard from "./components/AdminDashboard"

import ProtectedRoute from "./components/ProtectedRoute"

function App() {
  return (
    <Routes>

      {/* ================= AUTH ROUTES ================= */}
      <Route path="/" element={<PatientAuth />} />
      <Route path="/doctor-login" element={<DoctorAuth />} />
      <Route path="/admin-login" element={<AdminAuth />} />

      {/* ================= DASHBOARD ROUTES ================= */}

      {/* ✅ PATIENT DASHBOARD */}
      <Route
        path="/patient-dashboard"
        element={
          <ProtectedRoute role="patient">
            <PatientDashboard />
          </ProtectedRoute>
        }
      />

      {/* DOCTOR DASHBOARD */}
      <Route
        path="/doctor-dashboard"
        element={
          <ProtectedRoute role="doctor">
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />

      {/* ADMIN DASHBOARD */}
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* ================= FALLBACK ================= */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  )
}

export default App
