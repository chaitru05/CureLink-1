"use client"

import { useState } from "react"
import "./PatientDashboard.css"

export default function PatientDashboard({ onLogout }) {
  const [activeSection, setActiveSection] = useState("overview")
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [showBookingModal, setShowBookingModal] = useState(false)

  // Mock data
  const upcomingAppointments = [
    {
      id: 1,
      doctor: "Dr. Sarah Johnson",
      specialty: "Cardiologist",
      date: "2024-01-25",
      time: "10:00 AM",
      type: "Check-up",
      status: "confirmed",
    },
    {
      id: 2,
      doctor: "Dr. Michael Chen",
      specialty: "Dermatologist",
      date: "2024-01-28",
      time: "2:30 PM",
      type: "Consultation",
      status: "pending",
    },
  ]

  const doctors = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      specialty: "Cardiologist",
      rating: 4.9,
      experience: "15 years",
      image: "/female-doctor.png",
      availability: ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM"],
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      specialty: "Dermatologist",
      rating: 4.8,
      experience: "12 years",
      image: "/male-doctor.png",
      availability: ["10:00 AM", "11:00 AM", "1:00 PM", "2:30 PM", "4:00 PM"],
    },
    {
      id: 3,
      name: "Dr. Emily Brown",
      specialty: "Pediatrician",
      rating: 5.0,
      experience: "10 years",
      image: "/female-pediatrician.png",
      availability: ["9:30 AM", "11:00 AM", "1:30 PM", "3:00 PM", "4:30 PM"],
    },
    {
      id: 4,
      name: "Dr. Robert Williams",
      specialty: "Orthopedic",
      rating: 4.7,
      experience: "18 years",
      image: "/male-orthopedic-doctor.png",
      availability: ["8:00 AM", "10:00 AM", "12:00 PM", "2:00 PM", "5:00 PM"],
    },
  ]

  const visitHistory = [
    {
      id: 1,
      doctor: "Dr. Sarah Johnson",
      specialty: "Cardiologist",
      date: "2024-01-10",
      diagnosis: "Routine Check-up",
      prescription: "Aspirin 75mg daily",
      reports: ["ECG Report", "Blood Test Results"],
    },
    {
      id: 2,
      doctor: "Dr. Michael Chen",
      specialty: "Dermatologist",
      date: "2023-12-15",
      diagnosis: "Skin Allergy",
      prescription: "Antihistamine cream",
      reports: ["Skin Analysis Report"],
    },
    {
      id: 3,
      doctor: "Dr. Emily Brown",
      specialty: "Pediatrician",
      date: "2023-11-20",
      diagnosis: "Annual Physical",
      prescription: "Vitamin D supplements",
      reports: ["Growth Chart", "Vaccination Record"],
    },
  ]

  const handleBookAppointment = (doctor) => {
    setSelectedDoctor(doctor)
    setShowBookingModal(true)
  }

  const handleSlotSelection = (slot) => {
    console.log(`Booking appointment with ${selectedDoctor.name} at ${slot}`)
    setShowBookingModal(false)
    setSelectedDoctor(null)
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
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
            onClick={() => setActiveSection("book")}
            className={`nav-item ${activeSection === "book" ? "active" : ""}`}
          >
            <svg viewBox="0 0 24 24" fill="none" className="nav-icon" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Book Appointment
          </button>
          <button
            onClick={() => setActiveSection("appointments")}
            className={`nav-item ${activeSection === "appointments" ? "active" : ""}`}
          >
            <svg viewBox="0 0 24 24" fill="none" className="nav-icon" stroke="currentColor" strokeWidth="2">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Appointments
          </button>
          <button
            onClick={() => setActiveSection("history")}
            className={`nav-item ${activeSection === "history" ? "active" : ""}`}
          >
            <svg viewBox="0 0 24 24" fill="none" className="nav-icon" stroke="currentColor" strokeWidth="2">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Visit History
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
      <main className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-content">
            <h1 className="dashboard-title">
              {activeSection === "overview" && "Dashboard Overview"}
              {activeSection === "book" && "Book an Appointment"}
              {activeSection === "appointments" && "Upcoming Appointments"}
              {activeSection === "history" && "Medical History"}
            </h1>
            <div className="header-actions">
              <button className="notification-button">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
                </svg>
                <span className="notification-badge">3</span>
              </button>
              <div className="user-profile">
                <img src="/patient-profile.png" alt="User" className="user-avatar" />
                <div className="user-info">
                  <span className="user-name">John Doe</span>
                  <span className="user-role">Patient</span>
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
              <div className="stats-grid">
                <div className="stat-card stat-card-primary">
                  <div className="stat-icon-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" className="stat-icon" stroke="currentColor" strokeWidth="2">
                      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="stat-content">
                    <p className="stat-label">Upcoming</p>
                    <p className="stat-value">{upcomingAppointments.length}</p>
                    <p className="stat-description">Appointments scheduled</p>
                  </div>
                </div>

                <div className="stat-card stat-card-success">
                  <div className="stat-icon-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" className="stat-icon" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="stat-content">
                    <p className="stat-label">Completed</p>
                    <p className="stat-value">{visitHistory.length}</p>
                    <p className="stat-description">Total visits</p>
                  </div>
                </div>

                <div className="stat-card stat-card-warning">
                  <div className="stat-icon-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" className="stat-icon" stroke="currentColor" strokeWidth="2">
                      <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div className="stat-content">
                    <p className="stat-label">Prescriptions</p>
                    <p className="stat-value">5</p>
                    <p className="stat-description">Active medications</p>
                  </div>
                </div>

                <div className="stat-card stat-card-info">
                  <div className="stat-icon-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" className="stat-icon" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="stat-content">
                    <p className="stat-label">Reports</p>
                    <p className="stat-value">8</p>
                    <p className="stat-description">Medical documents</p>
                  </div>
                </div>
              </div>

              <div className="quick-actions">
                <h2 className="section-title">Quick Actions</h2>
                <div className="action-cards">
                  <button onClick={() => setActiveSection("book")} className="action-card action-card-animated">
                    <div className="action-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <h3 className="action-title">Book Appointment</h3>
                    <p className="action-description">Schedule a visit with your doctor</p>
                  </button>

                  <button onClick={() => setActiveSection("history")} className="action-card action-card-animated">
                    <div className="action-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="action-title">View Records</h3>
                    <p className="action-description">Access your medical history</p>
                  </button>

                  <button className="action-card action-card-animated">
                    <div className="action-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="action-title">Message Doctor</h3>
                    <p className="action-description">Send a secure message</p>
                  </button>
                </div>
              </div>

              <div className="recent-activity">
                <h2 className="section-title">Recent Appointments</h2>
                <div className="appointment-list">
                  {upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="appointment-card appointment-card-slide">
                      <div className="appointment-info">
                        <div className="appointment-avatar">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 7a4 4 0 108 0 4 4 0 00-8 0z" />
                          </svg>
                        </div>
                        <div className="appointment-details">
                          <h3 className="appointment-doctor">{appointment.doctor}</h3>
                          <p className="appointment-specialty">{appointment.specialty}</p>
                        </div>
                      </div>
                      <div className="appointment-meta">
                        <div className="appointment-datetime">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          <span>
                            {appointment.date} at {appointment.time}
                          </span>
                        </div>
                        <span className={`appointment-status status-${appointment.status}`}>{appointment.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Book Appointment Section */}
          {activeSection === "book" && (
            <div className="booking-section">
              <div className="section-header">
                <h2 className="section-title">Select a Doctor</h2>
                <p className="section-description">Choose from our experienced healthcare professionals</p>
              </div>

              <div className="doctors-grid">
                {doctors.map((doctor) => (
                  <div key={doctor.id} className="doctor-card doctor-card-hover">
                    <div className="doctor-image-wrapper">
                      <img src={doctor.image || "/placeholder.svg"} alt={doctor.name} className="doctor-image" />
                      <div className="doctor-rating">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="star-icon">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        {doctor.rating}
                      </div>
                    </div>
                    <div className="doctor-info">
                      <h3 className="doctor-name">{doctor.name}</h3>
                      <p className="doctor-specialty">{doctor.specialty}</p>
                      <div className="doctor-meta">
                        <span className="doctor-experience">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          {doctor.experience}
                        </span>
                      </div>
                      <button onClick={() => handleBookAppointment(doctor)} className="book-button">
                        View Schedule
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Appointments Section */}
          {activeSection === "appointments" && (
            <div className="appointments-section">
              <div className="section-header">
                <h2 className="section-title">Your Upcoming Appointments</h2>
                <button onClick={() => setActiveSection("book")} className="primary-button">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 4v16m8-8H4" />
                  </svg>
                  New Appointment
                </button>
              </div>

              <div className="appointments-list">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="appointment-detail-card">
                    <div className="appointment-header">
                      <div className="appointment-doctor-info">
                        <div className="doctor-avatar-large">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 7a4 4 0 108 0 4 4 0 00-8 0z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="appointment-doctor-name">{appointment.doctor}</h3>
                          <p className="appointment-doctor-specialty">{appointment.specialty}</p>
                        </div>
                      </div>
                      <span className={`appointment-badge badge-${appointment.status}`}>{appointment.status}</span>
                    </div>

                    <div className="appointment-body">
                      <div className="appointment-detail-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <div>
                          <p className="detail-label">Date</p>
                          <p className="detail-value">{appointment.date}</p>
                        </div>
                      </div>

                      <div className="appointment-detail-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="detail-label">Time</p>
                          <p className="detail-value">{appointment.time}</p>
                        </div>
                      </div>

                      <div className="appointment-detail-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>
                          <p className="detail-label">Type</p>
                          <p className="detail-value">{appointment.type}</p>
                        </div>
                      </div>
                    </div>

                    <div className="appointment-actions">
                      <button className="action-btn btn-secondary">Reschedule</button>
                      <button className="action-btn btn-danger">Cancel</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Visit History Section */}
          {activeSection === "history" && (
            <div className="history-section">
              <div className="section-header">
                <h2 className="section-title">Medical History & Records</h2>
                <div className="filter-buttons">
                  <button className="filter-btn active">All</button>
                  <button className="filter-btn">Prescriptions</button>
                  <button className="filter-btn">Reports</button>
                </div>
              </div>

              <div className="history-timeline">
                {visitHistory.map((visit, index) => (
                  <div
                    key={visit.id}
                    className="timeline-item timeline-item-animate"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <div className="visit-card">
                        <div className="visit-header">
                          <div className="visit-doctor-info">
                            <div className="visit-avatar">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 7a4 4 0 108 0 4 4 0 00-8 0z" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="visit-doctor-name">{visit.doctor}</h3>
                              <p className="visit-specialty">{visit.specialty}</p>
                            </div>
                          </div>
                          <span className="visit-date">{visit.date}</span>
                        </div>

                        <div className="visit-details">
                          <div className="visit-detail-row">
                            <span className="detail-label">Diagnosis:</span>
                            <span className="detail-value">{visit.diagnosis}</span>
                          </div>
                          <div className="visit-detail-row">
                            <span className="detail-label">Prescription:</span>
                            <span className="detail-value">{visit.prescription}</span>
                          </div>
                        </div>

                        <div className="visit-reports">
                          <h4 className="reports-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Medical Reports
                          </h4>
                          <div className="reports-list">
                            {visit.reports.map((report, idx) => (
                              <button key={idx} className="report-item">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                <span>{report}</span>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m14-7l-5-5m0 0L7 8m5-5v12" />
                                </svg>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Booking Modal */}
      {showBookingModal && selectedDoctor && (
        <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="modal-content modal-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Select Time Slot</h2>
              <button onClick={() => setShowBookingModal(false)} className="modal-close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-doctor-info">
                <img
                  src={selectedDoctor.image || "/placeholder.svg"}
                  alt={selectedDoctor.name}
                  className="modal-doctor-image"
                />
                <div>
                  <h3 className="modal-doctor-name">{selectedDoctor.name}</h3>
                  <p className="modal-doctor-specialty">{selectedDoctor.specialty}</p>
                </div>
              </div>

              <div className="time-slots">
                <h3 className="slots-title">Available Slots Today</h3>
                <div className="slots-grid">
                  {selectedDoctor.availability.map((slot, index) => (
                    <button
                      key={index}
                      onClick={() => handleSlotSelection(slot)}
                      className="slot-button slot-button-pop"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
