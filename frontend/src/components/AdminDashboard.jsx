"use client"

import { useState } from "react"
import "./AdminDashboard.css"

export default function AdminDashboard({ onLogout }) {
  const [activeSection, setActiveSection] = useState("overview")
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState(null)

  // Mock data for doctors
  const doctors = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      specialty: "Cardiology",
      status: "active",
      patients: 156,
      rating: 4.9,
      experience: "12 years",
      email: "sarah.j@curelink.com",
      phone: "+1 (555) 123-4567",
      avatar: "/female-doctor.png",
      joinDate: "2020-03-15",
      appointments: 1240,
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      specialty: "Orthopedics",
      status: "active",
      patients: 203,
      rating: 4.8,
      experience: "15 years",
      email: "m.chen@curelink.com",
      phone: "+1 (555) 234-5678",
      avatar: "/male-orthopedic-doctor.png",
      joinDate: "2019-07-22",
      appointments: 1890,
    },
    {
      id: 3,
      name: "Dr. Emily Rodriguez",
      specialty: "Pediatrics",
      status: "active",
      patients: 189,
      rating: 5.0,
      experience: "8 years",
      email: "emily.r@curelink.com",
      phone: "+1 (555) 345-6789",
      avatar: "/female-pediatrician.png",
      joinDate: "2021-01-10",
      appointments: 967,
    },
    {
      id: 4,
      name: "Dr. James Wilson",
      specialty: "General Medicine",
      status: "inactive",
      patients: 134,
      rating: 4.7,
      experience: "20 years",
      email: "j.wilson@curelink.com",
      phone: "+1 (555) 456-7890",
      avatar: "/male-doctor.png",
      joinDate: "2018-11-05",
      appointments: 2150,
    },
  ]

  // Mock appointments data
  const recentAppointments = [
    {
      id: 1,
      patient: "Sarah Martinez",
      doctor: "Dr. Sarah Johnson",
      date: "Today, 9:00 AM",
      status: "completed",
      type: "Consultation",
    },
    {
      id: 2,
      patient: "James Wilson",
      doctor: "Dr. Michael Chen",
      date: "Today, 10:30 AM",
      status: "in-progress",
      type: "Follow-up",
    },
    {
      id: 3,
      patient: "Emily Chen",
      doctor: "Dr. Emily Rodriguez",
      date: "Today, 2:00 PM",
      status: "scheduled",
      type: "Checkup",
    },
    {
      id: 4,
      patient: "Michael Brown",
      doctor: "Dr. Sarah Johnson",
      date: "Tomorrow, 9:30 AM",
      status: "scheduled",
      type: "Consultation",
    },
  ]

  // Platform statistics
  const stats = [
    {
      label: "Total Doctors",
      value: doctors.length,
      change: "+2 this month",
      trend: "up",
      icon: "users",
      color: "primary",
    },
    {
      label: "Active Patients",
      value: "682",
      change: "+12% from last week",
      trend: "up",
      icon: "heart",
      color: "success",
    },
    {
      label: "Appointments Today",
      value: "47",
      change: "8 pending",
      trend: "neutral",
      icon: "calendar",
      color: "warning",
    },
    {
      label: "Platform Revenue",
      value: "$42.5K",
      change: "+8.2% this month",
      trend: "up",
      icon: "dollar",
      color: "info",
    },
  ]

  const activeDoctors = doctors.filter((d) => d.status === "active")
  const totalPatients = doctors.reduce((sum, d) => sum + d.patients, 0)
  const avgRating = (doctors.reduce((sum, d) => sum + d.rating, 0) / doctors.length).toFixed(1)

  const handleViewDetails = (doctor) => {
    setSelectedDoctor(doctor)
    setShowViewModal(true)
  }

  const handleEditDoctor = (doctor) => {
    setEditingDoctor({ ...doctor })
    setShowEditModal(true)
  }

  const handleSaveEdit = () => {
    // Here you would typically make an API call to update the doctor
    console.log("Saving doctor:", editingDoctor)
    setShowEditModal(false)
    setEditingDoctor(null)
  }

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
            Analytics
          </button>
          <button
            onClick={() => setActiveSection("settings")}
            className={`nav-item ${activeSection === "settings" ? "active" : ""}`}
          >
            <svg viewBox="0 0 24 24" fill="none" className="nav-icon" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v6m0 6v6m-9-9h6m6 0h6" />
              <path d="M4.93 4.93l4.24 4.24m5.66 0l4.24-4.24M4.93 19.07l4.24-4.24m5.66 0l4.24 4.24" />
            </svg>
            Settings
          </button>
        </nav>

        <div className="sidebar-footer">
          <button onClick={onLogout} className="logout-button">
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
                {activeSection === "analytics" && "Platform Analytics"}
                {activeSection === "settings" && "System Settings"}
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
              <button className="notification-button">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
                </svg>
                <span className="notification-badge">3</span>
              </button>
              <div className="search-bar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input type="text" placeholder="Search..." />
              </div>
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
          {/* Overview Section */}
          {activeSection === "overview" && (
            <div className="overview-section">
              {/* Stats Grid */}
              <div className="stats-grid">
                {stats.map((stat, index) => (
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

              {/* Activity Grid */}
              <div className="activity-grid">
                {/* Quick Stats */}
                <div className="activity-card quick-stats-card">
                  <h3 className="card-title">Quick Stats</h3>
                  <div className="quick-stats-list">
                    <div className="quick-stat-item">
                      <div className="quick-stat-label">Active Doctors</div>
                      <div className="quick-stat-value">{activeDoctors.length}</div>
                      <div className="quick-stat-bar">
                        <div
                          className="quick-stat-progress"
                          style={{ width: `${(activeDoctors.length / doctors.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="quick-stat-item">
                      <div className="quick-stat-label">Total Patients</div>
                      <div className="quick-stat-value">{totalPatients}</div>
                      <div className="quick-stat-bar">
                        <div className="quick-stat-progress success" style={{ width: "85%" }}></div>
                      </div>
                    </div>
                    <div className="quick-stat-item">
                      <div className="quick-stat-label">Average Rating</div>
                      <div className="quick-stat-value">{avgRating}/5.0</div>
                      <div className="quick-stat-bar">
                        <div
                          className="quick-stat-progress warning"
                          style={{ width: `${(avgRating / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="activity-card recent-activity-card">
                  <h3 className="card-title">Recent Activity</h3>
                  <div className="activity-timeline">
                    <div className="activity-item">
                      <div className="activity-dot success"></div>
                      <div className="activity-content">
                        <p className="activity-text">
                          <strong>Dr. Sarah Johnson</strong> completed appointment with Sarah Martinez
                        </p>
                        <p className="activity-time">5 minutes ago</p>
                      </div>
                    </div>
                    <div className="activity-item">
                      <div className="activity-dot primary"></div>
                      <div className="activity-content">
                        <p className="activity-text">
                          <strong>New appointment</strong> scheduled with Dr. Michael Chen
                        </p>
                        <p className="activity-time">12 minutes ago</p>
                      </div>
                    </div>
                    <div className="activity-item">
                      <div className="activity-dot warning"></div>
                      <div className="activity-content">
                        <p className="activity-text">
                          <strong>Dr. Emily Rodriguez</strong> updated patient record
                        </p>
                        <p className="activity-time">1 hour ago</p>
                      </div>
                    </div>
                    <div className="activity-item">
                      <div className="activity-dot info"></div>
                      <div className="activity-content">
                        <p className="activity-text">
                          <strong>System backup</strong> completed successfully
                        </p>
                        <p className="activity-time">2 hours ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Appointments Table */}
              <div className="appointments-table-section">
                <div className="section-header">
                  <h3 className="section-title">Recent Appointments</h3>
                  <button className="view-all-btn">View All →</button>
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
                      {recentAppointments.map((apt) => (
                        <tr key={apt.id}>
                          <td>
                            <div className="table-user">
                              <div className="table-avatar">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
                                </svg>
                              </div>
                              {apt.patient}
                            </div>
                          </td>
                          <td>{apt.doctor}</td>
                          <td>{apt.date}</td>
                          <td>
                            <span className="type-badge">{apt.type}</span>
                          </td>
                          <td>
                            <span className={`status-badge ${apt.status}`}>
                              {apt.status === "completed" && "Completed"}
                              {apt.status === "in-progress" && "In Progress"}
                              {apt.status === "scheduled" && "Scheduled"}
                            </span>
                          </td>
                        </tr>
                      ))}
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

              <div className="doctors-grid">
                {doctors.map((doctor) => (
                  <div key={doctor.id} className="doctor-profile-card">
                    <div className="doctor-card-header">
                      <img
                        src={doctor.avatar || "/placeholder.svg"}
                        alt={doctor.name}
                        className="doctor-avatar-large"
                      />
                      <span className={`status-indicator ${doctor.status}`}></span>
                    </div>
                    <div className="doctor-card-body">
                      <h3 className="doctor-name">{doctor.name}</h3>
                      <p className="doctor-specialty">{doctor.specialty}</p>
                      <div className="doctor-rating">
                        <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <span>{doctor.rating}</span>
                        <span className="rating-count">({doctor.appointments} reviews)</span>
                      </div>
                      <div className="doctor-stats">
                        <div className="doctor-stat">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 108 0 4 4 0 00-8 0z" />
                          </svg>
                          <span>{doctor.patients} Patients</span>
                        </div>
                        <div className="doctor-stat">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          <span>{doctor.experience}</span>
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
                        <div className="contact-info-item">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                          </svg>
                          <span>{doctor.phone}</span>
                        </div>
                      </div>
                    </div>
                    <div className="doctor-card-footer">
                      <button className="card-action-btn secondary" onClick={() => handleViewDetails(doctor)}>
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
                    </div>
                  </div>
                ))}
              </div>
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
                <button className="filter-btn active">All</button>
                <button className="filter-btn">Scheduled</button>
                <button className="filter-btn">In Progress</button>
                <button className="filter-btn">Completed</button>
                <button className="filter-btn">Cancelled</button>
              </div>

              <div className="appointments-list-detailed">
                {recentAppointments.map((apt) => (
                  <div key={apt.id} className="appointment-card-detailed">
                    <div className="appointment-main-info">
                      <div className="appointment-users">
                        <div className="appointment-user-item">
                          <div className="user-avatar-small">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
                            </svg>
                          </div>
                          <div>
                            <p className="user-name-small">{apt.patient}</p>
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
                            <p className="user-name-small">{apt.doctor}</p>
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
                          <span>{apt.date}</span>
                        </div>
                        <div className="appointment-detail-item">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                          <span>{apt.type}</span>
                        </div>
                      </div>
                    </div>
                    <div className="appointment-actions">
                      <span className={`status-badge-large ${apt.status}`}>
                        {apt.status === "completed" && "✓ Completed"}
                        {apt.status === "in-progress" && "● In Progress"}
                        {apt.status === "scheduled" && "○ Scheduled"}
                      </span>
                      <button className="action-icon-btn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="12" cy="5" r="1" />
                          <circle cx="12" cy="19" r="1" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analytics Section */}
          {activeSection === "analytics" && (
            <div className="analytics-section">
              <div className="section-header">
                <h2 className="section-title">Platform Analytics</h2>
                <p className="section-description">Monitor platform performance and trends</p>
              </div>

              <div className="analytics-charts">
                <div className="chart-card">
                  <h3 className="chart-title">Appointment Trends</h3>
                  <div className="chart-placeholder">
                    <svg viewBox="0 0 400 200" className="line-chart">
                      <polyline
                        points="0,150 50,120 100,140 150,80 200,100 250,60 300,90 350,40 400,70"
                        fill="none"
                        stroke="var(--primary)"
                        strokeWidth="3"
                      />
                      <polyline
                        points="0,180 50,160 100,170 150,130 200,140 250,110 300,130 350,90 400,110"
                        fill="none"
                        stroke="var(--accent)"
                        strokeWidth="3"
                        strokeDasharray="5,5"
                      />
                    </svg>
                  </div>
                  <div className="chart-legend">
                    <div className="legend-item">
                      <span className="legend-color primary"></span>
                      <span>Completed</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-color accent"></span>
                      <span>Scheduled</span>
                    </div>
                  </div>
                </div>

                <div className="chart-card">
                  <h3 className="chart-title">Doctor Performance</h3>
                  <div className="performance-list">
                    {doctors.slice(0, 3).map((doctor, index) => (
                      <div key={doctor.id} className="performance-item">
                        <div className="performance-rank">#{index + 1}</div>
                        <img
                          src={doctor.avatar || "/placeholder.svg"}
                          alt={doctor.name}
                          className="performance-avatar"
                        />
                        <div className="performance-info">
                          <p className="performance-name">{doctor.name}</p>
                          <p className="performance-specialty">{doctor.specialty}</p>
                        </div>
                        <div className="performance-stats">
                          <div className="performance-stat">
                            <span className="stat-value-small">{doctor.patients}</span>
                            <span className="stat-label-small">Patients</span>
                          </div>
                          <div className="performance-stat">
                            <span className="stat-value-small">{doctor.rating}</span>
                            <span className="stat-label-small">Rating</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-icon primary">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                  </div>
                  <div className="metric-content">
                    <p className="metric-label">Response Time</p>
                    <p className="metric-value">2.4 min</p>
                    <p className="metric-change positive">-12% faster</p>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon success">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <div className="metric-content">
                    <p className="metric-label">Completion Rate</p>
                    <p className="metric-value">96.8%</p>
                    <p className="metric-change positive">+3.2% increase</p>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon warning">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  <div className="metric-content">
                    <p className="metric-label">Monthly Revenue</p>
                    <p className="metric-value">$42.5K</p>
                    <p className="metric-change positive">+8.2% growth</p>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon info">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M8.5 11a4 4 0 100-8 4 4 0 000 8zM20 8v6M23 11h-6" />
                    </svg>
                  </div>
                  <div className="metric-content">
                    <p className="metric-label">New Patients</p>
                    <p className="metric-value">+127</p>
                    <p className="metric-change positive">This month</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Section */}
          {activeSection === "settings" && (
            <div className="settings-section">
              <div className="section-header">
                <h2 className="section-title">System Settings</h2>
                <p className="section-description">Configure platform settings and preferences</p>
              </div>

              <div className="settings-grid">
                <div className="settings-card">
                  <h3 className="settings-card-title">General Settings</h3>
                  <div className="settings-list">
                    <div className="setting-item">
                      <div className="setting-info">
                        <p className="setting-label">Platform Name</p>
                        <p className="setting-description">The name displayed across the platform</p>
                      </div>
                      <input type="text" className="setting-input" value="CureLink" readOnly />
                    </div>
                    <div className="setting-item">
                      <div className="setting-info">
                        <p className="setting-label">Time Zone</p>
                        <p className="setting-description">Default time zone for appointments</p>
                      </div>
                      <select className="setting-select">
                        <option>UTC-5 (Eastern Time)</option>
                        <option>UTC-6 (Central Time)</option>
                        <option>UTC-7 (Mountain Time)</option>
                        <option>UTC-8 (Pacific Time)</option>
                      </select>
                    </div>
                    <div className="setting-item">
                      <div className="setting-info">
                        <p className="setting-label">Email Notifications</p>
                        <p className="setting-description">Send email notifications to users</p>
                      </div>
                      <label className="toggle-switch">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="settings-card">
                  <h3 className="settings-card-title">Security Settings</h3>
                  <div className="settings-list">
                    <div className="setting-item">
                      <div className="setting-info">
                        <p className="setting-label">Two-Factor Authentication</p>
                        <p className="setting-description">Require 2FA for admin accounts</p>
                      </div>
                      <label className="toggle-switch">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                    <div className="setting-item">
                      <div className="setting-info">
                        <p className="setting-label">Session Timeout</p>
                        <p className="setting-description">Auto logout after inactivity</p>
                      </div>
                      <select className="setting-select">
                        <option>15 minutes</option>
                        <option>30 minutes</option>
                        <option>1 hour</option>
                        <option>Never</option>
                      </select>
                    </div>
                    <div className="setting-item">
                      <div className="setting-info">
                        <p className="setting-label">Password Policy</p>
                        <p className="setting-description">Minimum password requirements</p>
                      </div>
                      <select className="setting-select">
                        <option>Strong (12+ chars, symbols)</option>
                        <option>Medium (8+ chars, numbers)</option>
                        <option>Basic (6+ chars)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-actions">
                <button className="settings-btn secondary">Reset to Defaults</button>
                <button className="settings-btn primary">Save Changes</button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Doctor Detail Modal */}
      {selectedDoctor && (
        <div className="modal-overlay" onClick={() => setSelectedDoctor(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Doctor Details</h2>
              <button className="modal-close" onClick={() => setSelectedDoctor(null)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="doctor-detail-header">
                <img
                  src={selectedDoctor.avatar || "/placeholder.svg"}
                  alt={selectedDoctor.name}
                  className="doctor-avatar-modal"
                />
                <div>
                  <h3>{selectedDoctor.name}</h3>
                  <p>{selectedDoctor.specialty}</p>
                  <p className="doctor-join-date">Joined {new Date(selectedDoctor.joinDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="doctor-detail-info">
                <p>
                  <strong>Email:</strong> {selectedDoctor.email}
                </p>
                <p>
                  <strong>Phone:</strong> {selectedDoctor.phone}
                </p>
                <p>
                  <strong>Experience:</strong> {selectedDoctor.experience}
                </p>
                <p>
                  <strong>Total Patients:</strong> {selectedDoctor.patients}
                </p>
                <p>
                  <strong>Total Appointments:</strong> {selectedDoctor.appointments}
                </p>
                <p>
                  <strong>Rating:</strong> {selectedDoctor.rating}/5.0
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-btn secondary" onClick={() => setSelectedDoctor(null)}>
                Close
              </button>
              <button className="modal-btn primary">Edit Profile</button>
            </div>
          </div>
        </div>
      )}

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
            <div className="modal-body">
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" className="form-input" placeholder="Dr. John Doe" />
              </div>
              <div className="form-group">
                <label>Specialty</label>
                <select className="form-input">
                  <option>Select Specialty</option>
                  <option>Cardiology</option>
                  <option>Orthopedics</option>
                  <option>Pediatrics</option>
                  <option>General Medicine</option>
                  <option>Dermatology</option>
                </select>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" className="form-input" placeholder="doctor@curelink.com" />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="tel" className="form-input" placeholder="+1 (555) 000-0000" />
              </div>
              <div className="form-group">
                <label>Experience (years)</label>
                <input type="number" className="form-input" placeholder="10" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-btn secondary" onClick={() => setShowAddDoctorModal(false)}>
                Cancel
              </button>
              <button className="modal-btn primary">Add Doctor</button>
            </div>
          </div>
        </div>
      )}

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
                <img
                  src={selectedDoctor.avatar || "/placeholder.svg"}
                  alt={selectedDoctor.name}
                  className="doctor-detail-avatar"
                />
                <div className="doctor-detail-info">
                  <h3 className="doctor-detail-name">{selectedDoctor.name}</h3>
                  <p className="doctor-detail-specialty">{selectedDoctor.specialty}</p>
                  <span className={`status-badge ${selectedDoctor.status}`}>
                    {selectedDoctor.status === "active" ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <div className="doctor-detail-grid">
                <div className="detail-item">
                  <div className="detail-label">Experience</div>
                  <div className="detail-value">{selectedDoctor.experience}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Rating</div>
                  <div className="detail-value">{selectedDoctor.rating}/5.0</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Patients</div>
                  <div className="detail-value">{selectedDoctor.patients}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Appointments</div>
                  <div className="detail-value">{selectedDoctor.appointments}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Email</div>
                  <div className="detail-value">{selectedDoctor.email}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Phone</div>
                  <div className="detail-value">{selectedDoctor.phone}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Join Date</div>
                  <div className="detail-value">
                    {new Date(selectedDoctor.joinDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Status</div>
                  <div className="detail-value">{selectedDoctor.status}</div>
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
                    value={editingDoctor.name}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Specialty</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingDoctor.specialty}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, specialty: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={editingDoctor.email}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={editingDoctor.phone}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Experience</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingDoctor.experience}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, experience: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-input"
                    value={editingDoctor.status}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-btn secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button className="modal-btn primary" onClick={handleSaveEdit}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
