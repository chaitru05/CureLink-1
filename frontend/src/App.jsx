"use client"

import { Routes, Route, Navigate, useNavigate } from "react-router-dom"

import PatientAuth from "./components/PatientAuth"
import DoctorAuth from "./components/DoctorAuth"
import AdminAuth from "./components/AdminAuth"

import PatientDashboard from "./components/PatientDashboard"
import DoctorDashboard from "./components/DoctorDashboard"
import AdminDashboard from "./components/AdminDashboard"

import ProtectedRoute from "./components/ProtectedRoute"

function AppRoutes() {
  const navigate = useNavigate()

  // ✅ THIS FIXES onRoleChange
  const handleRoleChange = (role) => {
    if (role === "patient") navigate("/")
    if (role === "doctor") navigate("/doctor-login")
    if (role === "admin") navigate("/admin-login")
  }

  return (
    <Routes>

      {/* ================= AUTH ROUTES ================= */}
      <Route
        path="/"
        element={<PatientAuth onRoleChange={handleRoleChange} />}
      />

      <Route path="/doctor-login" element={<DoctorAuth onRoleChange={handleRoleChange} />} />
      <Route path="/admin-login" element={<AdminAuth onRoleChange={handleRoleChange} />} />

      {/* ================= DASHBOARD ROUTES ================= */}

      <Route
        path="/patient-dashboard"
        element={
          <ProtectedRoute role="patient">
            <PatientDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/doctor-dashboard"
        element={
          <ProtectedRoute role="doctor">
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />

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

export default AppRoutes
