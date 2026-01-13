"use client"

import { useState } from "react"
import "./DoctorDashboard.css"

export default function DoctorDashboard({ onLogout }) {
  const [activeSection, setActiveSection] = useState("schedule")
  const [selectedSlot, setSelectedSlot] = useState(null)

  // Mock data for time slots
  const timeSlots = [
    {
      id: 1,
      time: "09:00 AM",
      status: "booked",
      patient: {
        name: "Sarah Martinez",
        age: 34,
        reason: "Persistent chest pain and shortness of breath during exercise",
        phone: "+1 (555) 123-4567",
        email: "sarah.m@email.com",
      },
    },
    {
      id: 2,
      time: "09:30 AM",
      status: "available",
    },
    {
      id: 3,
      time: "10:00 AM",
      status: "booked",
      patient: {
        name: "James Wilson",
        age: 52,
        reason: "Follow-up appointment for hypertension management and medication review",
        phone: "+1 (555) 234-5678",
        email: "j.wilson@email.com",
      },
    },
    {
      id: 4,
      time: "10:30 AM",
      status: "available",
    },
    {
      id: 5,
      time: "11:00 AM",
      status: "booked",
      patient: {
        name: "Emily Chen",
        age: 28,
        reason: "Severe migraine headaches occurring 3-4 times per week",
        phone: "+1 (555) 345-6789",
        email: "emily.chen@email.com",
      },
    },
    {
      id: 6,
      time: "11:30 AM",
      status: "available",
    },
    {
      id: 7,
      time: "02:00 PM",
      status: "booked",
      patient: {
        name: "Michael Brown",
        age: 45,
        reason: "Type 2 diabetes consultation and blood sugar level monitoring",
        phone: "+1 (555) 456-7890",
        email: "m.brown@email.com",
      },
    },
    {
      id: 8,
      time: "02:30 PM",
      status: "available",
    },
    {
      id: 9,
      time: "03:00 PM",
      status: "available",
    },
    {
      id: 10,
      time: "03:30 PM",
      status: "booked",
      patient: {
        name: "Jennifer Davis",
        age: 39,
        reason: "Chronic lower back pain affecting daily activities",
        phone: "+1 (555) 567-8901",
        email: "jen.davis@email.com",
      },
    },
    {
      id: 11,
      time: "04:00 PM",
      status: "available",
    },
    {
      id: 12,
      time: "04:30 PM",
      status: "available",
    },
  ]

  const todayPatients = timeSlots.filter((slot) => slot.status === "booked")
  const availableSlots = timeSlots.filter((slot) => slot.status === "available")

  const stats = [
    {
      label: "Today's Patients",
      value: todayPatients.length,
      icon: "users",
      color: "primary",
      trend: "+3 from yesterday",
    },
    {
      label: "Available Slots",
      value: availableSlots.length,
      icon: "calendar",
      color: "success",
      trend: `${availableSlots.length} open`,
    },
    {
      label: "Consultation Time",
      value: "4.5h",
      icon: "clock",
      color: "warning",
      trend: "Total scheduled",
    },
    {
      label: "Completion Rate",
      value: "94%",
      icon: "check",
      color: "info",
      trend: "This week",
    },
  ]

  const upcomingPatients = todayPatients.slice(0, 3)

  return (
    <div className="doctor-dashboard-container">
      {/* Sidebar */}
      <aside className="doctor-sidebar">
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
          <span className="doctor-badge">Doctor Portal</span>
        </div>

        <nav className="sidebar-nav">
          <button
            onClick={() => setActiveSection("schedule")}
            className={`nav-item ${activeSection === "schedule" ? "active" : ""}`}
          >
            <svg viewBox="0 0 24 24" fill="none" className="nav-icon" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Schedule
          </button>
          <button
            onClick={() => setActiveSection("patients")}
            className={`nav-item ${activeSection === "patients" ? "active" : ""}`}
          >
            <svg viewBox="0 0 24 24" fill="none" className="nav-icon" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 108 0 4 4 0 00-8 0zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
            Patients
          </button>
          <button
            onClick={() => setActiveSection("consultations")}
            className={`nav-item ${activeSection === "consultations" ? "active" : ""}`}
          >
            <svg viewBox="0 0 24 24" fill="none" className="nav-icon" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
            Consultations
          </button>
          <button
            onClick={() => setActiveSection("records")}
            className={`nav-item ${activeSection === "records" ? "active" : ""}`}
          >
            <svg viewBox="0 0 24 24" fill="none" className="nav-icon" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Medical Records
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
      <main className="doctor-main">
        {/* Header */}
        <header className="doctor-header">
          <div className="header-content">
            <div className="header-left">
              <h1 className="dashboard-title">
                {activeSection === "schedule" && "Today's Schedule"}
                {activeSection === "patients" && "Patient Management"}
                {activeSection === "consultations" && "Consultations"}
                {activeSection === "records" && "Medical Records"}
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
                <span className="notification-badge">5</span>
              </button>
              <div className="user-profile">
                <img src="/male-doctor.png" alt="Doctor" className="user-avatar" />
                <div className="user-info">
                  <span className="user-name">Dr. Sarah Johnson</span>
                  <span className="user-role">Cardiologist</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="dashboard-content">
          {/* Schedule Section */}
          {activeSection === "schedule" && (
            <div className="schedule-section">
              {/* Stats Grid */}
              <div className="stats-grid">
                {stats.map((stat, index) => (
                  <div key={index} className={`stat-card stat-${stat.color}`}>
                    <div className="stat-header">
                      <div className="stat-icon-wrapper">
                        {stat.icon === "users" && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 108 0 4 4 0 00-8 0zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
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
                        {stat.icon === "clock" && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                        )}
                        {stat.icon === "check" && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                          </svg>
                        )}
                      </div>
                      <span className="stat-value">{stat.value}</span>
                    </div>
                    <p className="stat-label">{stat.label}</p>
                    <p className="stat-trend">{stat.trend}</p>
                  </div>
                ))}
              </div>

              {/* Next Patient Preview */}
              <div className="next-patient-section">
                <h2 className="section-title">Next Appointment</h2>
                {upcomingPatients.length > 0 && (
                  <div className="next-patient-card">
                    <div className="patient-main-info">
                      <div className="patient-avatar-large">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
                        </svg>
                      </div>
                      <div className="patient-details">
                        <h3 className="patient-name">{upcomingPatients[0].patient.name}</h3>
                        <p className="patient-age">{upcomingPatients[0].patient.age} years old</p>
                        <div className="appointment-time-badge">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          {upcomingPatients[0].time}
                        </div>
                      </div>
                    </div>
                    <div className="patient-reason-section">
                      <h4 className="reason-title">Chief Complaint</h4>
                      <p className="reason-text">{upcomingPatients[0].patient.reason}</p>
                    </div>
                    <div className="patient-contact-info">
                      <div className="contact-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                        </svg>
                        <span>{upcomingPatients[0].patient.phone}</span>
                      </div>
                      <div className="contact-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                        <span>{upcomingPatients[0].patient.email}</span>
                      </div>
                    </div>
                    <button className="start-consultation-btn">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 3l14 9-14 9V3z" />
                      </svg>
                      Start Consultation
                    </button>
                  </div>
                )}
              </div>

              {/* Time Slots Grid */}
              <div className="slots-section">
                <div className="section-header-with-action">
                  <h2 className="section-title">Today's Time Slots</h2>
                  <div className="legend">
                    <div className="legend-item">
                      <span className="legend-dot available"></span>
                      <span>Available</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-dot booked"></span>
                      <span>Booked</span>
                    </div>
                  </div>
                </div>

                <div className="slots-grid">
                  {timeSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className={`slot-card ${slot.status} ${selectedSlot?.id === slot.id ? "selected" : ""}`}
                      onClick={() => slot.status === "booked" && setSelectedSlot(slot)}
                    >
                      <div className="slot-time">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        {slot.time}
                      </div>
                      {slot.status === "booked" ? (
                        <div className="slot-patient-info">
                          <div className="slot-patient-avatar">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
                            </svg>
                          </div>
                          <div className="slot-patient-details">
                            <p className="slot-patient-name">{slot.patient.name}</p>
                            <p className="slot-patient-age">{slot.patient.age} yrs</p>
                          </div>
                        </div>
                      ) : (
                        <div className="slot-available-badge">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                          </svg>
                          Open
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Patient Details Section */}
          {activeSection === "patients" && (
            <div className="patients-section">
              <div className="section-header">
                <h2 className="section-title">Today's Patients</h2>
                <p className="section-description">Manage and review patient appointments</p>
              </div>

              <div className="patients-list">
                {todayPatients.map((slot) => (
                  <div key={slot.id} className="patient-card">
                    <div className="patient-card-header">
                      <div className="patient-info">
                        <div className="patient-avatar">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="patient-card-name">{slot.patient.name}</h3>
                          <p className="patient-card-meta">
                            {slot.patient.age} years • {slot.time}
                          </p>
                        </div>
                      </div>
                      <span className="status-badge booked-badge">Confirmed</span>
                    </div>

                    <div className="patient-card-body">
                      <div className="reason-section">
                        <h4 className="reason-label">Medical Reason</h4>
                        <p className="reason-content">{slot.patient.reason}</p>
                      </div>

                      <div className="contact-section">
                        <div className="contact-row">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                          </svg>
                          <span>{slot.patient.phone}</span>
                        </div>
                        <div className="contact-row">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                          </svg>
                          <span>{slot.patient.email}</span>
                        </div>
                      </div>
                    </div>

                    <div className="patient-card-footer">
                      <button className="action-btn secondary-btn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        View Records
                      </button>
                      <button className="action-btn primary-btn-action">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 3l14 9-14 9V3z" />
                        </svg>
                        Start Consultation
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Patient Detail Modal */}
      {selectedSlot && (
        <div className="modal-overlay" onClick={() => setSelectedSlot(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Patient Details</h2>
              <button className="modal-close" onClick={() => setSelectedSlot(null)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-patient-header">
                <div className="modal-patient-avatar">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="modal-patient-name">{selectedSlot.patient.name}</h3>
                  <p className="modal-patient-age">{selectedSlot.patient.age} years old</p>
                </div>
              </div>

              <div className="modal-info-grid">
                <div className="modal-info-item">
                  <label>Appointment Time</label>
                  <p>{selectedSlot.time}</p>
                </div>
                <div className="modal-info-item">
                  <label>Phone</label>
                  <p>{selectedSlot.patient.phone}</p>
                </div>
                <div className="modal-info-item full-width">
                  <label>Email</label>
                  <p>{selectedSlot.patient.email}</p>
                </div>
              </div>

              <div className="modal-reason-section">
                <label>Medical Reason</label>
                <p className="modal-reason-text">{selectedSlot.patient.reason}</p>
              </div>
            </div>

            <div className="modal-footer">
              <button className="modal-btn secondary" onClick={() => setSelectedSlot(null)}>
                Close
              </button>
              <button className="modal-btn primary">Start Consultation</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
