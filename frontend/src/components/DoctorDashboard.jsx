import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axiosInstance from "../api/axiosInstance"
import DoctorSidebar from "./DoctorSidebar"
import "./DoctorDashboard.css"
import { fetchDoctorAvailability, updateDoctorAvailability } from "../api/doctorApi" // ✅ imported API functions

export default function DoctorDashboard() {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState("overview")
  const [doctorName, setDoctorName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Statistics
  const [stats, setStats] = useState({
    todayAppointments: 0,
    upcomingAppointments: 0,
    completedConsultations: 0,
    totalPatientsTreated: 0,
  })

  // Appointments
  const [appointments, setAppointments] = useState([])

  // Availability
  const [selectedDate, setSelectedDate] = useState("")
  const [availableSlots, setAvailableSlots] = useState([]) // ✅ will use API functions
  const [newSlot, setNewSlot] = useState({ startTime: "", endTime: "" })

  // Patient Records
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showRecordModal, setShowRecordModal] = useState(false)
  const [recordForm, setRecordForm] = useState({
    diagnosis: "",
    symptoms: "",
    prescriptions: "",
    followUpDate: "",
  })

  // Calendar
  const [calendarEvents, setCalendarEvents] = useState([])

  // Notifications
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Get doctor info from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem("user")
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        setDoctorName(user.name || user.fullName || "Doctor")
      } catch (e) {
        setDoctorName("Doctor")
      }
    }
  }, [])

  // Load dashboard data
  useEffect(() => {
    if (activeSection === "overview") {
      loadOverviewData()
    } else if (activeSection === "appointments") {
      loadAppointments()
    } else if (activeSection === "availability") {
      const today = new Date().toISOString().split("T")[0]
      setSelectedDate(today)
      loadAvailability(today) // ✅ updated
    } else if (activeSection === "records") {
      loadPatients()
    } else if (activeSection === "calendar") {
      loadCalendar()
    } else if (activeSection === "notifications") {
      loadNotifications()
    }
  }, [activeSection])

  const loadOverviewData = async () => {
    try {
      setLoading(true)
      setError(null)

      let appointmentsData = []
      try {
        const res = await axiosInstance.get("/appointments/doctor")
        appointmentsData = res.data || []
      } catch (err) {
        console.warn("Error loading appointments:", err)
      }

      const today = new Date().toISOString().split("T")[0]
      const todayApps = appointmentsData.filter((apt) => apt.date === today && apt.status !== "cancelled")
      const upcoming = appointmentsData.filter(
        (apt) => new Date(apt.date) > new Date() && apt.status !== "cancelled" && apt.status !== "completed"
      )
      const completed = appointmentsData.filter((apt) => apt.status === "completed")
      const uniquePatients = new Set(completed.map((apt) => apt.patient?.id || apt.patientId)).size

      setStats({
        todayAppointments: todayApps.length,
        upcomingAppointments: upcoming.length,
        completedConsultations: completed.length,
        totalPatientsTreated: uniquePatients,
      })
    } catch (err) {
      console.error("Unexpected error loading overview:", err)
    } finally {
      setLoading(false)
    }
  }

  const loadAppointments = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await axiosInstance.get("/appointments/doctor")
      setAppointments(res.data || [])
    } catch (err) {
      console.error("Error loading appointments:", err)
      setError(err.response?.data?.message || "Failed to load appointments. Please try again later.")
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (appointmentId, status) => {
    try {
      setLoading(true)
      setError(null)
      await axiosInstance.put(`/appointments/${appointmentId}/status`, { status })
      await Promise.all([loadAppointments(), loadOverviewData()])
    } catch (err) {
      console.error("Error updating status:", err)
      setError(err.response?.data?.message || "Failed to update appointment status. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return

    try {
      setLoading(true)
      setError(null)
      await axiosInstance.put(`/appointments/${appointmentId}/cancel`)
      await Promise.all([loadAppointments(), loadOverviewData()])
    } catch (err) {
      console.error("Error cancelling appointment:", err)
      setError(err.response?.data?.message || "Failed to cancel appointment. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // ✅ Updated: Load Availability using doctorApi function
  const loadAvailability = async (date) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"))
      if (!user?._id) return

      const slots = await fetchDoctorAvailability(user._id) // use API function
      setAvailableSlots(slots || [])
    } catch (err) {
      console.error("Error loading availability:", err)
    }
  }

  const handleDateChange = (date) => {
    setSelectedDate(date)
    loadAvailability(date)
  }

  // ✅ Updated: Add Slot using doctorApi function
  const handleAddSlot = async () => {
    if (!newSlot.startTime || !newSlot.endTime) {
      setError("Please provide both start and end time")
      return
    }

    try {
      setLoading(true)
      setError(null)

      const updatedSlots = [...availableSlots, { startTime: newSlot.startTime, endTime: newSlot.endTime }]
      await updateDoctorAvailability(updatedSlots) // use API function

      setNewSlot({ startTime: "", endTime: "" })
      loadAvailability(selectedDate)
    } catch (err) {
      console.error("Error adding slot:", err)
      setError(err.response?.data?.message || "Failed to add time slot. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // ✅ Updated: Remove Slot using doctorApi function
  const handleRemoveSlot = async (slotId) => {
    try {
      setLoading(true)
      setError(null)

      const updatedSlots = availableSlots.filter((slot) => slot._id !== slotId)
      await updateDoctorAvailability(updatedSlots) // use API function

      loadAvailability(selectedDate)
    } catch (err) {
      console.error("Error removing slot:", err)
      setError(err.response?.data?.message || "Failed to remove time slot. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const loadPatients = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await axiosInstance.get("/patients")
      setPatients(res.data || [])
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error("Error loading patients:", err)
        setError(err.response?.data?.message || "Failed to load patients. Please try again later.")
      }
      setPatients([])
    } finally {
      setLoading(false)
    }
  }

  const handleOpenRecordModal = (patient) => {
    setSelectedPatient(patient)
    setRecordForm({
      diagnosis: "",
      symptoms: "",
      prescriptions: "",
      followUpDate: "",
    })
    setShowRecordModal(true)
  }

  const handleSubmitRecord = async () => {
    if (!recordForm.diagnosis || !recordForm.symptoms) {
      setError("Please fill in required fields (Diagnosis and Symptoms)")
      return
    }

    try {
      setLoading(true)
      setError(null)
      await axiosInstance.post("/medical-records", {
        patientId: selectedPatient.id || selectedPatient._id,
        diagnosis: recordForm.diagnosis,
        symptoms: recordForm.symptoms,
        prescriptions: recordForm.prescriptions,
        followUpDate: recordForm.followUpDate || null,
      })
      setShowRecordModal(false)
      setSelectedPatient(null)
      setRecordForm({ diagnosis: "", symptoms: "", prescriptions: "", followUpDate: "" })
      setError(null)
    } catch (err) {
      console.error("Error creating medical record:", err)
      setError(err.response?.data?.message || "Failed to create medical record. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const loadCalendar = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await axiosInstance.get("/calendar/doctor")
      setCalendarEvents(res.data || [])
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error("Error loading calendar:", err)
        setError(err.response?.data?.message || "Failed to load calendar. Please try again later.")
      }
      setCalendarEvents([])
    } finally {
      setLoading(false)
    }
  }

  const loadNotifications = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await axiosInstance.get("/notifications/doctor")
      const notifs = res.data || []
      setNotifications(notifs)
      setUnreadCount(notifs.filter((n) => !n.read).length)
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error("Error loading notifications:", err)
        setError(err.response?.data?.message || "Failed to load notifications. Please try again later.")
      }
      setNotifications([])
      setUnreadCount(0)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    localStorage.removeItem("user")
    navigate("/doctor-login")
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (timeString) => {
    if (!timeString) return "N/A"
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="doctor-dashboard-container">
      <DoctorSidebar activeSection={activeSection} setActiveSection={setActiveSection} onLogout={handleLogout} />

      <main className="doctor-main">
        <header className="doctor-header">
          <div className="header-content">
            <div>
              <h1 className="dashboard-greeting">Hello, Dr. {doctorName}</h1>
              <p className="dashboard-date">{today}</p>
            </div>
            <div className="header-actions">
              <button
                onClick={() => setActiveSection("notifications")}
                className="notification-button"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
              </button>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          {error && (
            <div className="error-message">
              {error}
              <button onClick={() => setError(null)}>×</button>
            </div>
          )}

          {loading && <div className="loading-overlay">Loading...</div>}

          {/* Dashboard Overview */}
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
                    <p className="stat-label">Today's Appointments</p>
                    <p className="stat-value">{stats.todayAppointments}</p>
                  </div>
                </div>

                <div className="stat-card stat-card-success">
                  <div className="stat-icon-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" className="stat-icon" stroke="currentColor" strokeWidth="2">
                      <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="stat-content">
                    <p className="stat-label">Upcoming Appointments</p>
                    <p className="stat-value">{stats.upcomingAppointments}</p>
                  </div>
                </div>

                <div className="stat-card stat-card-warning">
                  <div className="stat-icon-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" className="stat-icon" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="stat-content">
                    <p className="stat-label">Completed Consultations</p>
                    <p className="stat-value">{stats.completedConsultations}</p>
                  </div>
                </div>

                <div className="stat-card stat-card-info">
                  <div className="stat-icon-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" className="stat-icon" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 108 0 4 4 0 00-8 0zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                    </svg>
                  </div>
                  <div className="stat-content">
                    <p className="stat-label">Total Patients Treated</p>
                    <p className="stat-value">{stats.totalPatientsTreated}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* My Appointments Section */}
          {activeSection === "appointments" && (
            <div className="appointments-section">
              <div className="section-header">
                <h2 className="section-title">My Appointments</h2>
              </div>

              <div className="appointments-list">
                {appointments.length === 0 ? (
                  <p className="empty-state">No appointments found</p>
                ) : (
                  appointments.map((appointment) => (
                    <div key={appointment.id || appointment._id} className="appointment-detail-card">
                      <div className="appointment-header">
                        <div className="appointment-patient-info">
                          <div className="patient-avatar-large">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 7a4 4 0 108 0 4 4 0 00-8 0z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="appointment-patient-name">
                              {appointment.patient?.name || appointment.patientName || "Patient"}
                            </h3>
                            <p className="appointment-type">
                              {appointment.consultationType || appointment.type || "Consultation"}
                            </p>
                          </div>
                        </div>
                        <span className={`appointment-badge badge-${appointment.status}`}>
                          {appointment.status}
                        </span>
                      </div>

                      <div className="appointment-body">
                        <div className="appointment-detail-item">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <div>
                            <p className="detail-label">Date</p>
                            <p className="detail-value">{formatDate(appointment.date)}</p>
                          </div>
                        </div>

                        <div className="appointment-detail-item">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <p className="detail-label">Time</p>
                            <p className="detail-value">
                              {appointment.timeSlot || appointment.time || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {appointment.status !== "cancelled" && appointment.status !== "completed" && (
                        <div className="appointment-actions">
                          <button
                            onClick={() => handleUpdateStatus(appointment.id || appointment._id, "completed")}
                            className="action-btn btn-success"
                          >
                            Mark as Completed
                          </button>
                          <button
                            onClick={() => handleCancelAppointment(appointment.id || appointment._id)}
                            className="action-btn btn-danger"
                          >
                            Cancel Appointment
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Manage Availability Section */}
          {activeSection === "availability" && (
            <div className="availability-section">
              <div className="section-header">
                <h2 className="section-title">Manage Availability</h2>
              </div>

              <div className="availability-container">
                <div className="form-group">
                  <label>Select Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div className="slots-management">
                  <h3 className="subsection-title">Time Slots</h3>

                  <div className="add-slot-form">
                    <div className="slot-input-group">
                      <input
                        type="time"
                        value={newSlot.startTime}
                        onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                        placeholder="Start Time"
                      />
                      <input
                        type="time"
                        value={newSlot.endTime}
                        onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                        placeholder="End Time"
                      />
                      <button onClick={handleAddSlot} className="primary-button">
                        Add Slot
                      </button>
                    </div>
                  </div>

                  <div className="slots-list">
                    {availableSlots.length === 0 ? (
                      <p className="empty-state">No slots available for this date</p>
                    ) : (
                      availableSlots.map((slot) => (
                        <div key={slot._id || slot.id} className="slot-item">
                          <span className="slot-time">
                            {slot.startTime} - {slot.endTime}
                          </span>
                          <span className={`slot-status ${slot.isBooked ? "booked" : "available"}`}>
                            {slot.isBooked ? "Booked" : "Available"}
                          </span>
                          {!slot.isBooked && (
                            <button
                              onClick={() => handleRemoveSlot(slot._id || slot.id)}
                              className="remove-slot-btn"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Patient Records Section */}
          {activeSection === "records" && (
            <div className="records-section">
              <div className="section-header">
                <h2 className="section-title">Patient Records</h2>
              </div>

              <div className="patients-list">
                {patients.length === 0 ? (
                  <p className="empty-state">No patients found</p>
                ) : (
                  patients.map((patient) => (
                    <div key={patient.id || patient._id} className="patient-record-card">
                      <div className="patient-record-header">
                        <div className="patient-record-info">
                          <div className="patient-avatar">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 7a4 4 0 108 0 4 4 0 00-8 0z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="patient-name">{patient.name || patient.fullName || "Patient"}</h3>
                            <p className="patient-email">{patient.email || "N/A"}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleOpenRecordModal(patient)}
                          className="primary-button"
                        >
                          Add Medical Record
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Calendar Section */}
          {activeSection === "calendar" && (
            <div className="calendar-section">
              <div className="section-header">
                <h2 className="section-title">Calendar</h2>
              </div>

              <div className="calendar-container">
                {calendarEvents.length === 0 ? (
                  <p className="empty-state">No calendar events found</p>
                ) : (
                  <div className="calendar-events">
                    {calendarEvents.map((event, idx) => (
                      <div key={idx} className={`calendar-event event-${event.type || "default"}`}>
                        <div className="event-marker"></div>
                        <div className="event-content">
                          <h4 className="event-title">{event.title || "Event"}</h4>
                          <p className="event-date">
                            {formatDate(event.date || event.dateTime)} {event.time && `at ${event.time}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notifications Section */}
          {activeSection === "notifications" && (
            <div className="notifications-section">
              <div className="section-header">
                <h2 className="section-title">Notifications</h2>
              </div>

              <div className="notifications-list">
                {notifications.length === 0 ? (
                  <p className="empty-state">No notifications</p>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id || notification._id}
                      className={`notification-card ${!notification.read ? "unread" : ""}`}
                    >
                      <h4 className="notification-title">{notification.title || "Notification"}</h4>
                      <p className="notification-message">{notification.message || notification.content}</p>
                      <span className="notification-time">
                        {formatDate(notification.createdAt || notification.date)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Medical Record Modal */}
      {showRecordModal && selectedPatient && (
        <div className="modal-overlay" onClick={() => setShowRecordModal(false)}>
          <div className="modal-content modal-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add Medical Record</h2>
              <button onClick={() => setShowRecordModal(false)} className="modal-close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-patient-info">
                <h3>Patient: {selectedPatient.name || selectedPatient.fullName}</h3>
              </div>

              <div className="booking-form">
                <div className="form-group">
                  <label>Diagnosis *</label>
                  <input
                    type="text"
                    value={recordForm.diagnosis}
                    onChange={(e) => setRecordForm({ ...recordForm, diagnosis: e.target.value })}
                    placeholder="Enter diagnosis"
                  />
                </div>

                <div className="form-group">
                  <label>Symptoms *</label>
                  <textarea
                    value={recordForm.symptoms}
                    onChange={(e) => setRecordForm({ ...recordForm, symptoms: e.target.value })}
                    placeholder="Describe symptoms"
                    rows="4"
                  />
                </div>

                <div className="form-group">
                  <label>Prescriptions</label>
                  <textarea
                    value={recordForm.prescriptions}
                    onChange={(e) => setRecordForm({ ...recordForm, prescriptions: e.target.value })}
                    placeholder="Enter prescriptions"
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label>Follow-up Date</label>
                  <input
                    type="date"
                    value={recordForm.followUpDate}
                    onChange={(e) => setRecordForm({ ...recordForm, followUpDate: e.target.value })}
                  />
                </div>

                <button onClick={handleSubmitRecord} className="primary-button" disabled={loading}>
                  {loading ? "Submitting..." : "Submit Record"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
