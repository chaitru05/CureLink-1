"use client"

import { useState } from "react"
import PatientAuth from "./components/PatientAuth"
import DoctorAuth from "./components/DoctorAuth"
import AdminAuth from "./components/AdminAuth"
import PatientDashboard from "./components/PatientDashboard"
import DoctorDashboard from "./components/DoctorDashboard"
import AdminDashboard from "./components/AdminDashboard"

function App() {
  const [currentRole, setCurrentRole] = useState("patient")
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleRoleChange = (newRole) => {
    setCurrentRole(newRole)
  }

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
  }

  return (
    <div className="App">
      {isLoggedIn && currentRole === "patient" ? (
        <PatientDashboard onLogout={handleLogout} />
      ) : isLoggedIn && currentRole === "doctor" ? (
        <DoctorDashboard onLogout={handleLogout} />
      ) : isLoggedIn && currentRole === "admin" ? (
        <AdminDashboard onLogout={handleLogout} />
      ) : (
        <>
          {currentRole === "patient" && <PatientAuth onRoleChange={handleRoleChange} onLogin={handleLogin} />}
          {currentRole === "doctor" && <DoctorAuth onRoleChange={handleRoleChange} onLogin={handleLogin} />}
          {currentRole === "admin" && <AdminAuth onRoleChange={handleRoleChange} onLogin={handleLogin} />}
        </>
      )}
    </div>
  )
}

export default App

// import { Routes, Route, Navigate } from "react-router-dom";

// import PatientAuth from "./components/PatientAuth";
// import DoctorAuth from "./components/DoctorAuth";
// import AdminAuth from "./components/AdminAuth";

// import PatientDashboard from "./components/PatientDashboard";
// import DoctorDashboard from "./components/DoctorDashboard";
// import AdminDashboard from "./components/AdminDashboard";

// import ProtectedRoute from "./components/ProtectedRoute";

// function App() {
//   return (
//     <Routes>
//       {/* Auth */}
//       <Route path="/" element={<PatientAuth />} />
//       <Route path="/doctor-login" element={<DoctorAuth />} />
//       <Route path="/admin-login" element={<AdminAuth />} />

//       {/* Dashboards */}
//       <Route
//         path="/patient-dashboard"
//         element={
//           <ProtectedRoute role="patient">
//             <PatientDashboard />
//           </ProtectedRoute>
//         }
//       />

//       <Route
//         path="/doctor-dashboard"
//         element={
//           <ProtectedRoute role="doctor">
//             <DoctorDashboard />
//           </ProtectedRoute>
//         }
//       />

//       <Route
//         path="/admin-dashboard"
//         element={
//           <ProtectedRoute role="admin">
//             <AdminDashboard />
//           </ProtectedRoute>
//         }
//       />

//       {/* Fallback */}
//       <Route path="*" element={<Navigate to="/" replace />} />
//     </Routes>
//   );
// }

// export default App;

