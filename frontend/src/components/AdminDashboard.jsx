"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./AdminDashboard.css"
import axios from "../api/axiosInstance"

export default function AdminDashboard({ onLogout }) {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState("overview")
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState(null)
  
  // Data states
  const [doctors, setDoctors] = useState([])
  const [appointments, setAppointments] = useState([])
  const [stats, setStats] = useState(null)
  const [adminLogs, setAdminLogs] = useState([])
  const [platformActivities, setPlatformActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Filter states
  const [appointmentFilter, setAppointmentFilter] = useState("all")
  
  // Form states for add doctor
  const [newDoctor, setNewDoctor] = useState({
    name: "",
    email: "",
    password: "",
    specialization: "",
    experience: ""
  })

  // Fetch platform statistics
  const fetchStats = async () => {
    try {
      const { data } = await axios.get("/admin/stats")
      setStats(data)
    } catch (err) {
      console.error("Error fetching stats:", err)
    }
  }

  // Fetch all doctors
  const fetchDoctors = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get("/admin/doctors")
      setDoctors(data)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch doctors")
      console.error("Error fetching doctors:", err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch all appointments
  const fetchAppointments = async () => {
    try {
      const params = {}
      if (appointmentFilter !== "all") {
        params.status = appointmentFilter === "scheduled" ? "confirmed" : appointmentFilter
      }
      
      const { data } = await axios.get("/admin/appointments", { params })
      setAppointments(data)
    } catch (err) {
      console.error("Error fetching appointments:", err)
      setError(err.response?.data?.message || "Failed to fetch appointments")
    }
  }

  // Fetch admin logs
  const fetchAdminLogs = async () => {
    try {
      const { data } = await axios.get("/admin/logs", { params: { limit: 50 } })
      setAdminLogs(data)
    } catch (err) {
      console.error("Error fetching logs:", err)
    }
  }

  // Fetch platform activities
  const fetchPlatformActivities = async () => {
    try {
      const { data } = await axios.get("/admin/platform-activities", { params: { limit: 100 } })
      setPlatformActivities(data)
    } catch (err) {
      console.error("Error fetching platform activities:", err)
    }
  }

  // Load data based on active section
  useEffect(() => {
    fetchStats()
    
    if (activeSection === "doctors") {
      fetchDoctors()
    } else if (activeSection === "appointments") {
      fetchAppointments()
    } else if (activeSection === "analytics") {
      fetchAdminLogs()
      fetchPlatformActivities()
    } else if (activeSection === "overview") {
      // Load recent data for overview
      fetchAppointments()
      fetchAdminLogs()
      fetchPlatformActivities()
    }
  }, [activeSection, appointmentFilter])

  // Create new doctor
  const handleCreateDoctor = async (e) => {
    e.preventDefault()
    try {
      await axios.post("/admin/doctor", newDoctor)
      setShowAddDoctorModal(false)
      setNewDoctor({ name: "", email: "", password: "", specialization: "", experience: "" })
      fetchDoctors()
      fetchStats()
      alert("Doctor created successfully!")
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create doctor")
    }
  }

  // Update doctor
  const handleUpdateDoctor = async () => {
    try {
      await axios.put(`/admin/doctor/${editingDoctor._id}`, {
        name: editingDoctor.name,
        email: editingDoctor.email,
        specialization: editingDoctor.specialization,
        experience: editingDoctor.experience
      })
      setShowEditModal(false)
      setEditingDoctor(null)
      fetchDoctors()
      alert("Doctor updated successfully!")
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update doctor")
    }
  }

  // Delete doctor
  const handleDeleteDoctor = async (doctorId) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) return
    
    try {
      await axios.delete(`/admin/doctor/${doctorId}`)
      fetchDoctors()
      fetchStats()
      alert("Doctor deleted successfully!")
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete doctor")
    }
  }

  // Update appointment status
  const handleUpdateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      await axios.put(`/admin/appointment/${appointmentId}/status`, { status: newStatus })
      await fetchAppointments()
      await fetchStats()
      if (activeSection === "analytics") {
        await fetchPlatformActivities()
      }
      alert("Appointment status updated successfully!")
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update appointment")
    }
  }

  // Cancel appointment
  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return
    
    try {
      await axios.put(`/admin/appointment/${appointmentId}/cancel`)
      await fetchAppointments()
      await fetchStats()
      if (activeSection === "analytics") {
        await fetchPlatformActivities()
      }
      alert("Appointment cancelled successfully!")
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel appointment")
    }
  }

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    localStorage.removeItem("user")
    if (onLogout) {
      onLogout()
    } else {
      navigate("/admin-login")
    }
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
      })
    }
  }

  // Format time ago
  const timeAgo = (dateString) => {
    if (!dateString) return "Unknown"
    const date = new Date(dateString)
    const seconds = Math.floor((new Date() - date) / 1000)
    
    if (seconds < 60) return `${seconds} seconds ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
    return `${Math.floor(seconds / 86400)} days ago`
  }

  // Calculate stats for display
  const displayStats = stats ? [
    {
      label: "Total Doctors",
      value: stats.totalDoctors || 0,
      change: `Active on platform`,
      trend: "up",
      icon: "users",
      color: "primary",
    },
    {
      label: "Active Patients",
      value: stats.totalPatients || 0,
      change: `Registered patients`,
      trend: "up",
      icon: "heart",
      color: "success",
    },
    {
      label: "Appointments Today",
      value: stats.appointmentsToday || 0,
      change: `${stats.pendingAppointments || 0} pending`,
      trend: "neutral",
      icon: "calendar",
      color: "warning",
    },
    {
      label: "Total Appointments",
      value: stats.totalAppointments || 0,
      change: `${stats.completedAppointments || 0} completed`,
      trend: "up",
      icon: "dollar",
      color: "info",
    },
  ] : []

  const filteredAppointments = appointments.filter(apt => {
    if (appointmentFilter === "all") return true
    if (appointmentFilter === "scheduled") return apt.status === "confirmed"
    return apt.status === appointmentFilter
  })

  return (
    <div className="admin-dashboard-container">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="sidebar-logo-icon"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <span className="sidebar-logo-text">CureLink</span>
          </div>
          <span className="admin-badge">Admin Panel</span>
        </div>

        <nav className="sidebar-nav">
          <button
            onClick={() => setActiveSection("overview")}
            className={`nav-item ${activeSection === "overview" ? "active" : ""}`}
          >
            <svg viewBox="0 0 24 24" fill="none" className="nav-icon" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            Overview
          </button>
          <button
            onClick={() => setActiveSection("doctors")}
            className={`nav-item ${activeSection === "doctors" ? "active" : ""}`}
          >
            <svg viewBox="0 0 24 24" fill="none" className="nav-icon" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 108 0 4 4 0 00-8 0zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
            Doctors
          </button>
          <button
            onClick={() => setActiveSection("appointments")}
            className={`nav-item ${activeSection === "appointments" ? "active" : ""}`}
          >
            <svg viewBox="0 0 24 24" fill="none" className="nav-icon" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Appointments
          </button>
          <button
            onClick={() => setActiveSection("analytics")}
            className={`nav-item ${activeSection === "analytics" ? "active" : ""}`}
          >
            <svg viewBox="0 0 24 24" fill="none" className="nav-icon" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="20" x2="12" y2="10" />
              <line x1="18" y1="20" x2="18" y2="4" />
              <line x1="6" y1="20" x2="6" y2="16" />
            </svg>
            Activity Logs
          </button>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-button">
            <svg viewBox="0 0 24 24" fill="none" className="nav-icon" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4m7 14l5-5-5-5m5 5H9" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div className="header-content">
            <div className="header-left">
              <h1 className="dashboard-title">
                {activeSection === "overview" && "Platform Overview"}
                {activeSection === "doctors" && "Doctor Management"}
                {activeSection === "appointments" && "Appointment Management"}
                {activeSection === "analytics" && "Platform Activity Logs"}
              </h1>
              <p className="dashboard-subtitle">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="header-actions">
              <div className="user-profile">
                <div className="user-avatar-admin">A</div>
                <div className="user-info">
                  <span className="user-name">Admin</span>
                  <span className="user-role">System Administrator</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="dashboard-content">
          {error && (
            <div className="error-message" style={{ padding: "1rem", background: "#fee", color: "#c33", borderRadius: "8px", marginBottom: "1rem" }}>
              {error}
            </div>
          )}

          {/* Overview Section */}
          {activeSection === "overview" && (
            <div className="overview-section">
              {/* Stats Grid */}
              <div className="stats-grid">
                {displayStats.map((stat, index) => (
                  <div key={index} className={`stat-card stat-${stat.color}`}>
                    <div className="stat-icon-wrapper">
                      {stat.icon === "users" && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 108 0 4 4 0 00-8 0z" />
                        </svg>
                      )}
                      {stat.icon === "heart" && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                        </svg>
                      )}
                      {stat.icon === "calendar" && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                      )}
                      {stat.icon === "dollar" && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="12" y1="1" x2="12" y2="23" />
                          <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                        </svg>
                      )}
                    </div>
                    <div className="stat-content">
                      <p className="stat-label">{stat.label}</p>
                      <p className="stat-value">{stat.value}</p>
                      <p className={`stat-trend ${stat.trend}`}>
                        {stat.trend === "up" && "↗"}
                        {stat.change}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Activity */}
              <div className="activity-grid">
                <div className="activity-card recent-activity-card">
                  <h3 className="card-title">Recent Activity</h3>
                  <div className="activity-timeline">
                    {adminLogs.slice(0, 5).map((log, index) => (
                      <div key={index} className="activity-item">
                        <div className="activity-dot success"></div>
                        <div className="activity-content">
                          <p className="activity-text">
                            <strong>{log.action}</strong> - {log.description}
                          </p>
                          <p className="activity-time">{timeAgo(log.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                    {adminLogs.length === 0 && (
                      <p style={{ padding: "1rem", color: "#666" }}>No recent activity</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Appointments Table */}
              <div className="appointments-table-section">
                <div className="section-header">
                  <h3 className="section-title">Recent Appointments</h3>
                  <button className="view-all-btn" onClick={() => setActiveSection("appointments")}>
                    View All →
                  </button>
                </div>
                <div className="appointments-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Doctor</th>
                        <th>Date & Time</th>
                        <th>Type</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.slice(0, 5).map((apt) => (
                        <tr key={apt._id}>
                          <td>
                            <div className="table-user">
                              <div className="table-avatar">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
                                </svg>
                              </div>
                              {apt.patientId?.name || "N/A"}
                            </div>
                          </td>
                          <td>{apt.doctorId?.name || "N/A"}</td>
                          <td>{formatDate(apt.appointmentDate)}</td>
                          <td>
                            <span className="type-badge">{apt.consultationType || "Consultation"}</span>
                          </td>
                          <td>
                            <span className={`status-badge ${apt.status}`}>
                              {apt.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {appointments.length === 0 && (
                        <tr>
                          <td colSpan="5" style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
                            No appointments found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Doctors Section */}
          {activeSection === "doctors" && (
            <div className="doctors-section">
              <div className="section-header-with-action">
                <div>
                  <h2 className="section-title">Doctor Management</h2>
                  <p className="section-description">Manage doctor profiles and credentials</p>
                </div>
                <button className="add-doctor-btn" onClick={() => setShowAddDoctorModal(true)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add New Doctor
                </button>
              </div>

              {loading ? (
                <div style={{ padding: "2rem", textAlign: "center" }}>Loading doctors...</div>
              ) : (
                <div className="doctors-grid">
                  {doctors.map((doctor) => (
                    <div key={doctor._id} className="doctor-profile-card">
                      <div className="doctor-card-header">
                        <div className="doctor-avatar-large" style={{ background: "#e0e0e0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "40px", height: "40px" }}>
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
                          </svg>
                        </div>
                        <span className="status-indicator active"></span>
                      </div>
                      <div className="doctor-card-body">
                        <h3 className="doctor-name">{doctor.name}</h3>
                        <p className="doctor-specialty">{doctor.specialization || "General Medicine"}</p>
                        <div className="doctor-stats">
                          <div className="doctor-stat">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 108 0 4 4 0 00-8 0z" />
                            </svg>
                            <span>{doctor.patientCount || 0} Patients</span>
                          </div>
                          <div className="doctor-stat">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            <span>{doctor.experience || 0} years</span>
                          </div>
                        </div>
                        <div className="doctor-contact">
                          <div className="contact-info-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                              <polyline points="22,6 12,13 2,6" />
                            </svg>
                            <span>{doctor.email}</span>
                          </div>
                        </div>
                      </div>
                      <div className="doctor-card-footer">
                        <button className="card-action-btn secondary" onClick={() => {
                          setSelectedDoctor(doctor)
                          setShowViewModal(true)
                        }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                          View Details
                        </button>
                        <button className="card-action-btn primary" onClick={() => handleEditDoctor(doctor)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                          Edit
                        </button>
                        <button className="card-action-btn danger" onClick={() => handleDeleteDoctor(doctor._id)} style={{ background: "#dc3545", color: "white" }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  {doctors.length === 0 && !loading && (
                    <div style={{ gridColumn: "1 / -1", padding: "2rem", textAlign: "center", color: "#666" }}>
                      No doctors found. Add your first doctor!
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Appointments Section */}
          {activeSection === "appointments" && (
            <div className="appointments-management-section">
              <div className="section-header">
                <h2 className="section-title">Appointment Management</h2>
                <p className="section-description">Monitor and manage all platform appointments</p>
              </div>

              <div className="appointment-filters">
                <button 
                  className={`filter-btn ${appointmentFilter === "all" ? "active" : ""}`}
                  onClick={() => setAppointmentFilter("all")}
                >
                  All
                </button>
                <button 
                  className={`filter-btn ${appointmentFilter === "scheduled" ? "active" : ""}`}
                  onClick={() => setAppointmentFilter("scheduled")}
                >
                  Scheduled
                </button>
                <button 
                  className={`filter-btn ${appointmentFilter === "completed" ? "active" : ""}`}
                  onClick={() => setAppointmentFilter("completed")}
                >
                  Completed
                </button>
                <button 
                  className={`filter-btn ${appointmentFilter === "cancelled" ? "active" : ""}`}
                  onClick={() => setAppointmentFilter("cancelled")}
                >
                  Cancelled
                </button>
              </div>

              <div className="appointments-list-detailed">
                {filteredAppointments.map((apt) => (
                  <div key={apt._id} className="appointment-card-detailed">
                    <div className="appointment-main-info">
                      <div className="appointment-users">
                        <div className="appointment-user-item">
                          <div className="user-avatar-small">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
                            </svg>
                          </div>
                          <div>
                            <p className="user-name-small">{apt.patientId?.name || "N/A"}</p>
                            <p className="user-label">Patient</p>
                          </div>
                        </div>
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="arrow-icon"
                        >
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                        <div className="appointment-user-item">
                          <div className="user-avatar-small doctor">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
                            </svg>
                          </div>
                          <div>
                            <p className="user-name-small">{apt.doctorId?.name || "N/A"}</p>
                            <p className="user-label">Doctor</p>
                          </div>
                        </div>
                      </div>
                      <div className="appointment-details-grid">
                        <div className="appointment-detail-item">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          <span>{formatDate(apt.appointmentDate)}</span>
                        </div>
                        <div className="appointment-detail-item">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                          <span>{apt.consultationType || "Consultation"}</span>
                        </div>
                        {apt.reasonForVisit && (
                          <div className="appointment-detail-item">
                            <span>Reason: {apt.reasonForVisit}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="appointment-actions">
                      <span className={`status-badge-large ${apt.status}`}>
                        {apt.status === "completed" && "✓ Completed"}
                        {apt.status === "confirmed" && "○ Confirmed"}
                        {apt.status === "pending" && "○ Pending"}
                        {apt.status === "cancelled" && "✗ Cancelled"}
                      </span>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        {apt.status !== "completed" && apt.status !== "cancelled" && (
                          <>
                            <button 
                              className="modal-btn primary"
                              onClick={() => handleUpdateAppointmentStatus(apt._id, "completed")}
                              style={{ 
                                padding: "0.5rem 1rem", 
                                fontSize: "0.875rem",
                                background: "#10b981",
                                border: "none",
                                borderRadius: "6px",
                                color: "white",
                                cursor: "pointer"
                              }}
                              title="Mark as completed"
                            >
                              Mark Completed
                            </button>
                            <button 
                              className="modal-btn secondary"
                              onClick={() => handleUpdateAppointmentStatus(apt._id, "pending")}
                              style={{ 
                                padding: "0.5rem 1rem", 
                                fontSize: "0.875rem",
                                background: "#f59e0b",
                                border: "none",
                                borderRadius: "6px",
                                color: "white",
                                cursor: "pointer"
                              }}
                              title="Mark as pending"
                            >
                              Mark Pending
                            </button>
                            <button 
                              className="modal-btn"
                              onClick={() => handleCancelAppointment(apt._id)}
                              style={{ 
                                padding: "0.5rem 1rem", 
                                fontSize: "0.875rem",
                                background: "#ef4444",
                                border: "none",
                                borderRadius: "6px",
                                color: "white",
                                cursor: "pointer"
                              }}
                              title="Cancel appointment"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {apt.status === "pending" && (
                          <>
                            <button 
                              className="modal-btn primary"
                              onClick={() => handleUpdateAppointmentStatus(apt._id, "confirmed")}
                              style={{ 
                                padding: "0.5rem 1rem", 
                                fontSize: "0.875rem",
                                background: "#3b82f6",
                                border: "none",
                                borderRadius: "6px",
                                color: "white",
                                cursor: "pointer"
                              }}
                              title="Confirm appointment"
                            >
                              Confirm
                            </button>
                            <button 
                              className="modal-btn"
                              onClick={() => handleCancelAppointment(apt._id)}
                              style={{ 
                                padding: "0.5rem 1rem", 
                                fontSize: "0.875rem",
                                background: "#ef4444",
                                border: "none",
                                borderRadius: "6px",
                                color: "white",
                                cursor: "pointer"
                              }}
                              title="Cancel appointment"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {filteredAppointments.length === 0 && (
                  <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
                    No appointments found
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Analytics/Activity Logs Section */}
          {activeSection === "analytics" && (
            <div className="analytics-section">
              <div className="section-header">
                <h2 className="section-title">Platform Activity Logs</h2>
                <p className="section-description">Monitor all administrative actions and platform activity</p>
              </div>

              {/* Admin Activity Section */}
              <div style={{ marginBottom: "2rem" }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem", color: "#1f2937" }}>
                  Admin Activity
                </h3>
                <div className="activity-timeline" style={{ background: "white", borderRadius: "8px", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                  {adminLogs.map((log, index) => (
                    <div key={index} className="activity-item" style={{ marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: index < adminLogs.length - 1 ? "1px solid #e5e7eb" : "none" }}>
                      <div className="activity-dot success"></div>
                      <div className="activity-content">
                        <p className="activity-text">
                          <strong style={{ color: "#059669" }}>{log.action}</strong>
                          {log.adminId?.name && <span style={{ color: "#6b7280" }}> by {log.adminId.name}</span>}
                        </p>
                        <p className="activity-description" style={{ color: "#4b5563", marginTop: "0.25rem" }}>{log.description}</p>
                        <p className="activity-time" style={{ fontSize: "0.875rem", color: "#9ca3af", marginTop: "0.5rem" }}>
                          {new Date(log.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {adminLogs.length === 0 && (
                    <p style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
                      No admin activity logs found
                    </p>
                  )}
                </div>
              </div>

              {/* Platform Activity Section */}
              <div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem", color: "#1f2937" }}>
                  Platform Overview Activity
                </h3>
                <div className="activity-timeline" style={{ background: "white", borderRadius: "8px", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                  {platformActivities.map((activity, index) => (
                    <div key={index} className="activity-item" style={{ marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: index < platformActivities.length - 1 ? "1px solid #e5e7eb" : "none" }}>
                      <div className="activity-dot" style={{ 
                        background: activity.action.includes("Registered") ? "#3b82f6" : 
                                   activity.action.includes("Created") ? "#10b981" : 
                                   activity.action.includes("Cancelled") ? "#ef4444" : 
                                   activity.action.includes("Updated") ? "#f59e0b" : "#8b5cf6"
                      }}></div>
                      <div className="activity-content">
                        <p className="activity-text">
                          <strong style={{ 
                            color: activity.action.includes("Registered") ? "#3b82f6" : 
                                   activity.action.includes("Created") ? "#10b981" : 
                                   activity.action.includes("Cancelled") ? "#ef4444" : 
                                   activity.action.includes("Updated") ? "#f59e0b" : "#8b5cf6"
                          }}>
                            {activity.action}
                          </strong>
                          {activity.userId?.name && (
                            <span style={{ color: "#6b7280" }}>
                              {" "}by {activity.userId.name} ({activity.userId.role})
                            </span>
                          )}
                        </p>
                        <p className="activity-description" style={{ color: "#4b5563", marginTop: "0.25rem" }}>
                          {activity.description}
                        </p>
                        <p className="activity-time" style={{ fontSize: "0.875rem", color: "#9ca3af", marginTop: "0.5rem" }}>
                          {new Date(activity.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {platformActivities.length === 0 && (
                    <p style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
                      No platform activities found
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add Doctor Modal */}
      {showAddDoctorModal && (
        <div className="modal-overlay" onClick={() => setShowAddDoctorModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Doctor</h2>
              <button className="modal-close" onClick={() => setShowAddDoctorModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreateDoctor}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Dr. John Doe"
                    value={newDoctor.name}
                    onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Specialty</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Cardiology"
                    value={newDoctor.specialization}
                    onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    placeholder="doctor@curelink.com"
                    value={newDoctor.email}
                    onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    placeholder="Enter password"
                    value={newDoctor.password}
                    onChange={(e) => setNewDoctor({ ...newDoctor, password: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Experience (years)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="10"
                    value={newDoctor.experience}
                    onChange={(e) => setNewDoctor({ ...newDoctor, experience: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="modal-btn secondary" onClick={() => setShowAddDoctorModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="modal-btn primary">Add Doctor</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Doctor Modal */}
      {showViewModal && selectedDoctor && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Doctor Details</h2>
              <button className="modal-close" onClick={() => setShowViewModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="doctor-detail-header">
                <div className="doctor-detail-avatar" style={{ background: "#e0e0e0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "60px", height: "60px" }}>
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
                  </svg>
                </div>
                <div className="doctor-detail-info">
                  <h3 className="doctor-detail-name">{selectedDoctor.name}</h3>
                  <p className="doctor-detail-specialty">{selectedDoctor.specialization || "General Medicine"}</p>
                </div>
              </div>
              <div className="doctor-detail-grid">
                <div className="detail-item">
                  <div className="detail-label">Experience</div>
                  <div className="detail-value">{selectedDoctor.experience || 0} years</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Patients</div>
                  <div className="detail-value">{selectedDoctor.patientCount || 0}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Appointments</div>
                  <div className="detail-value">{selectedDoctor.appointmentCount || 0}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Email</div>
                  <div className="detail-value">{selectedDoctor.email}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Join Date</div>
                  <div className="detail-value">
                    {new Date(selectedDoctor.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-btn secondary" onClick={() => setShowViewModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Doctor Modal */}
      {showEditModal && editingDoctor && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Edit Doctor Profile</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingDoctor.name || ""}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Specialty</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingDoctor.specialization || ""}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, specialization: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={editingDoctor.email || ""}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Experience (years)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editingDoctor.experience || ""}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, experience: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-btn secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button className="modal-btn primary" onClick={handleUpdateDoctor}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
