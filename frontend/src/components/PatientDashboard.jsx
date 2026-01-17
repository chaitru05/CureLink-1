import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axiosInstance from "../api/axiosInstance"
import Sidebar from "./Sidebar"
import "./PatientDashboard.css"

export default function PatientDashboard() {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState("overview")
  const [patientName, setPatientName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Statistics
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    completedAppointments: 0,
    medicinesToday: 0,
    totalRecords: 0,
  })

  // Doctors & Booking
  const [doctors, setDoctors] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [availableSlots, setAvailableSlots] = useState([])
  const [selectedDate, setSelectedDate] = useState("")
  const [bookingForm, setBookingForm] = useState({
    date: "",
    timeSlot: "",
    consultationType: "in-person",
    reason: "",
  })
  const [showBookingModal, setShowBookingModal] = useState(false)

  // Appointments
  const [appointments, setAppointments] = useState([])

  // Medicines
  const [medicines, setMedicines] = useState([])

  // Medical Records
  const [medicalRecords, setMedicalRecords] = useState([])

  // Calendar
  const [calendarEvents, setCalendarEvents] = useState([])

  // Notifications
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Get patient info from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem("user")
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        setPatientName(user.name || user.fullName || "Patient")
      } catch (e) {
        setPatientName("Patient")
      }
    }
  }, [])

  // Load dashboard data
  useEffect(() => {
    if (activeSection === "overview") {
      loadOverviewData()
    } else if (activeSection === "book") {
      loadDoctors()
    } else if (activeSection === "appointments") {
      loadAppointments()
    } else if (activeSection === "medicines") {
      loadMedicines()
    } else if (activeSection === "records") {
      loadMedicalRecords()
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
      
      // Make API calls individually to handle failures gracefully
      let appointmentsData = []
      let medicinesData = []
      let recordsData = []

      // Load appointments
      try {
        const apptsRes = await axiosInstance.get("/appointments/patient")
        appointmentsData = apptsRes.data || []
      } catch (err) {
        console.warn("Error loading appointments:", err)
        // Continue with empty array
      }

      // Load medicines
      try {
        const medicinesRes = await axiosInstance.get("/reminders/today")
        medicinesData = medicinesRes.data || []
      } catch (err) {
        console.warn("Error loading medicines:", err)
        // Continue with empty array
      }

      // Load records
      try {
        const recordsRes = await axiosInstance.get("/medical-records/patient")
        recordsData = recordsRes.data || []
      } catch (err) {
        // 404 is acceptable if endpoint doesn't exist yet
        if (err.response?.status !== 404) {
          console.warn("Error loading medical records:", err)
        }
        // Continue with empty array
      }

      const upcoming = appointmentsData.filter(
        (apt) => new Date(apt.date) >= new Date() && apt.status !== "cancelled" && apt.status !== "completed"
      )
      const completed = appointmentsData.filter((apt) => apt.status === "completed")

      setStats({
        upcomingAppointments: upcoming.length,
        completedAppointments: completed.length,
        medicinesToday: medicinesData.length || 0,
        totalRecords: recordsData.length || 0,
      })
    } catch (err) {
      console.error("Unexpected error loading overview:", err)
      // Don't set error for overview - it's non-critical
    } finally {
      setLoading(false)
    }
  }

  const loadDoctors = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await axiosInstance.get("/doctors")
      setDoctors(res.data || [])
    } catch (err) {
      console.error("Error loading doctors:", err)
      setError(err.response?.data?.message || "Failed to load doctors. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const loadDoctorAvailability = async (doctorId, date) => {
    try {
      setLoading(true)
      setError(null)
  
      const res = await axiosInstance.get(
        `/doctors/${doctorId}/availability?date=${date}`
      )
  
      console.log("Availability API response:", res.data)
  
      // ✅ FIX: extract slots correctly
      if (Array.isArray(res.data) && res.data.length > 0) {
        setAvailableSlots(res.data[0].slots)
      } else {
        setAvailableSlots([])
      }
  
    } catch (err) {
      console.error("Error loading availability:", err)
      setAvailableSlots([])
    } finally {
      setLoading(false)
    }
  }
  
  

  const handleViewAvailability = (doctor) => {
    setSelectedDoctor(doctor)
  
    const today = new Date().toISOString().split("T")[0]
  
    setSelectedDate(today)
    setBookingForm((prev) => ({
      ...prev,
      date: today,
      timeSlot: ""
    }))
  
    // ✅ MUST USE _id
    loadDoctorAvailability(doctor._id, today)
    console.log("Selected doctor:", doctor)
    console.log("Doctor ID:", doctor._id)

  
    setShowBookingModal(true)
  }
  

  const handleDateChange = (date) => {
    setSelectedDate(date)
    setBookingForm((prev) => ({ ...prev, date, timeSlot: "" }))
  
    if (selectedDoctor) {
      loadDoctorAvailability(selectedDoctor._id, date)
    }
  }
  

  const handleBookAppointment = async () => {
    if (!bookingForm.date || !bookingForm.timeSlot || !bookingForm.reason) {
      setError("Please fill all required fields")
      return
    }
  
    try {
      setLoading(true)
  
      await axiosInstance.post("/appointments", {
        doctorId: selectedDoctor._id,   // ✅ FIXED
        appointmentDate: bookingForm.date, // ⚠️ IMPORTANT (backend expects this)
        timeSlot: bookingForm.timeSlot,
        consultationType: bookingForm.consultationType,
        reasonForVisit: bookingForm.reason
      })
  
      setShowBookingModal(false)
      setSelectedDoctor(null)
      setBookingForm({
        date: "",
        timeSlot: "",
        consultationType: "in-person",
        reason: ""
      })
  
      setActiveSection("appointments")
      await Promise.all([loadAppointments(), loadOverviewData()])
      setError(null)
  
    } catch (err) {
      console.error("Error booking appointment:", err)
      setError(err.response?.data?.message || "Failed to book appointment")
    } finally {
      setLoading(false)
    }
  }
  

  const loadAppointments = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await axiosInstance.get("/appointments/patient")
      setAppointments(res.data || [])
    } catch (err) {
      console.error("Error loading appointments:", err)
      setError(err.response?.data?.message || "Failed to load appointments. Please try again later.")
      setAppointments([])
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

  const loadMedicines = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await axiosInstance.get("/reminders/today")
      setMedicines(res.data || [])
    } catch (err) {
      console.error("Error loading medicines:", err)
      setError(err.response?.data?.message || "Failed to load medicines. Please try again later.")
      setMedicines([])
    } finally {
      setLoading(false)
    }
  }

  const handleMarkTaken = async (reminderId) => {
    try {
      setLoading(true)
      setError(null)
      await axiosInstance.put(`/reminders/${reminderId}/taken`)
      await Promise.all([loadMedicines(), loadOverviewData()])
    } catch (err) {
      console.error("Error marking medicine:", err)
      setError(err.response?.data?.message || "Failed to update medicine status. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const loadMedicalRecords = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await axiosInstance.get("/medical-records/patient")
      setMedicalRecords(res.data || [])
    } catch (err) {
      // 404 is acceptable if endpoint doesn't exist yet
      if (err.response?.status === 404) {
        console.info("Medical records endpoint not available yet")
        setMedicalRecords([])
      } else {
        console.error("Error loading records:", err)
        setError(err.response?.data?.message || "Failed to load medical records. Please try again later.")
        setMedicalRecords([])
      }
    } finally {
      setLoading(false)
    }
  }

  const loadCalendar = async () => {
    try {
      setLoading(true)
      setError(null)
  
      const res = await axiosInstance.get("/calendar/patient")
      console.log("Calendar API response:", res.data)
      // ✅ ALWAYS normalize response to array
      let events = []
  
      if (Array.isArray(res.data)) {
        events = res.data
      } else if (Array.isArray(res.data?.events)) {
        events = res.data.events
      }
  
      setCalendarEvents(events)
  
    } catch (err) {
      if (err.response?.status === 404) {
        console.info("Calendar endpoint not available yet")
        setCalendarEvents([])
      } else {
        console.error("Error loading calendar:", err)
        setError(
          err.response?.data?.message ||
          "Failed to load calendar. Please try again later."
        )
        setCalendarEvents([])
      }
    } finally {
      setLoading(false)
    }
  }
  

  const loadNotifications = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await axiosInstance.get("/notifications/patient")
      const notifs = res.data || []
      setNotifications(notifs)
      setUnreadCount(notifs.filter((n) => !n.read).length)
    } catch (err) {
      // 404 is acceptable if endpoint doesn't exist yet
      if (err.response?.status === 404) {
        console.info("Notifications endpoint not available yet")
        setNotifications([])
        setUnreadCount(0)
      } else {
        console.error("Error loading notifications:", err)
        setError(err.response?.data?.message || "Failed to load notifications. Please try again later.")
        setNotifications([])
        setUnreadCount(0)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    localStorage.removeItem("user")
    navigate("/")
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (timeString) => {
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
    <div className="dashboard-container">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} onLogout={handleLogout} />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-content">
            <div>
              <h1 className="dashboard-greeting">Hello, {patientName}</h1>
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
                    <p className="stat-label">Upcoming Appointments</p>
                    <p className="stat-value">{stats.upcomingAppointments}</p>
                  </div>
                </div>

                <div className="stat-card stat-card-success">
                  <div className="stat-icon-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" className="stat-icon" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="stat-content">
                    <p className="stat-label">Completed Appointments</p>
                    <p className="stat-value">{stats.completedAppointments}</p>
                  </div>
                </div>

                <div className="stat-card stat-card-warning">
                  <div className="stat-icon-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" className="stat-icon" stroke="currentColor" strokeWidth="2">
                      <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div className="stat-content">
                    <p className="stat-label">Medicines Today</p>
                    <p className="stat-value">{stats.medicinesToday}</p>
                  </div>
                </div>

                <div className="stat-card stat-card-info">
                  <div className="stat-icon-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" className="stat-icon" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="stat-content">
                    <p className="stat-label">Total Medical Records</p>
                    <p className="stat-value">{stats.totalRecords}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Book Appointment Section */}
          {/* Book Appointment Section */}
{activeSection === "book" && (
  <div className="booking-section">
    <div className="section-header">
      <h2 className="section-title">Select a Doctor</h2>
      <p className="section-description">
        Choose from our experienced healthcare professionals
      </p>
    </div>

    <div className="doctors-grid">
      {doctors.map((doctor) => (
        <div
          key={doctor._id}   // ✅ correct
          className="doctor-card doctor-card-hover"
        >
          <div className="doctor-info">
            <h3 className="doctor-name">{doctor.name}</h3>
            <p className="doctor-specialty">
              {doctor.specialization || doctor.specialty}
            </p>

            {doctor.experience && (
              <div className="doctor-meta">
                <span className="doctor-experience">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2" />
                  </svg>
                  {doctor.experience} yrs
                </span>
              </div>
            )}

            <button
              onClick={() => handleViewAvailability(doctor)}
              className="book-button"
            >
              View Availability
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
)}


          {/* My Appointments Section */}
          {/* My Appointments Section */}
{activeSection === "appointments" && (
  <div className="appointments-section">
    <div className="section-header">
      <h2 className="section-title">My Appointments</h2>
      <button
        onClick={() => setActiveSection("book")}
        className="primary-button"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 4v16m8-8H4" />
        </svg>
        New Appointment
      </button>
    </div>

    <div className="appointments-list">
      {appointments.length === 0 ? (
        <p className="empty-state">No appointments found</p>
      ) : (
        appointments.map((appointment) => (
          <div
            key={appointment._id}   // ✅ FIXED
            className="appointment-detail-card"
          >
            <div className="appointment-header">
              <div className="appointment-doctor-info">
                <div className="doctor-avatar-large">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
                    <path d="M9 7a4 4 0 108 0 4 4 0 00-8 0z" />
                  </svg>
                </div>

                <div>
                  <h3 className="appointment-doctor-name">
                    {appointment.doctor?.name ||
                      appointment.doctorName ||
                      "Doctor"}
                  </h3>
                  <p className="appointment-doctor-specialty">
                    {appointment.doctor?.specialization ||
                      appointment.specialization ||
                      ""}
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
                  <path d="M8 7V3m8 4V3m-9 8h10" />
                </svg>
                <div>
                  <p className="detail-label">Date</p>
                  <p className="detail-value">
                    {formatDate(
                      appointment.appointmentDate || appointment.date
                    )}
                  </p>
                </div>
              </div>

              <div className="appointment-detail-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 8v4l3 3" />
                </svg>
                <div>
                  <p className="detail-label">Time</p>
                  <p className="detail-value">
                    {appointment.timeSlot || "N/A"}
                  </p>
                </div>
              </div>

              <div className="appointment-detail-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12h6m-6 4h6" />
                </svg>
                <div>
                  <p className="detail-label">Type</p>
                  <p className="detail-value">
                    {appointment.consultationType || "Consultation"}
                  </p>
                </div>
              </div>
            </div>

            {appointment.status !== "cancelled" &&
              appointment.status !== "completed" && (
                <div className="appointment-actions">
                  <button
                    onClick={() =>
                      handleCancelAppointment(appointment._id) // ✅ FIXED
                    }
                    className="action-btn btn-danger"
                  >
                    Cancel
                  </button>
                </div>
              )}
          </div>
        ))
      )}
    </div>
  </div>
)}

          {/* Medicines Section */}
          {activeSection === "medicines" && (
            <div className="medicines-section">
              <div className="section-header">
                <h2 className="section-title">Medicine Reminders</h2>
              </div>

              <div className="medicines-list">
                {medicines.length === 0 ? (
                  <p className="empty-state">No medicines scheduled for today</p>
                ) : (
                  medicines.map((medicine) => (
                    <div key={medicine.id} className="medicine-card">
                      <div className="medicine-info">
                        <h3 className="medicine-name">{medicine.medicineName || medicine.name}</h3>
                        <p className="medicine-dosage">Dosage: {medicine.dosage || "N/A"}</p>
                        <p className="medicine-time">Time: {formatTime(medicine.time || medicine.scheduledTime)}</p>
                      </div>
                      {!medicine.taken && (
                        <button
                          onClick={() => handleMarkTaken(medicine.id)}
                          className="medicine-button"
                        >
                          Mark as Taken
                        </button>
                      )}
                      {medicine.taken && (
                        <span className="medicine-status-taken">✓ Taken</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Medical Records Section */}
          {activeSection === "records" && (
            <div className="records-section">
              <div className="section-header">
                <h2 className="section-title">Medical Records</h2>
              </div>

              <div className="records-list">
                {medicalRecords.length === 0 ? (
                  <p className="empty-state">No medical records found</p>
                ) : (
                  medicalRecords.map((record) => (
                    <div key={record.id} className="record-card">
                      <div className="record-header">
                        <h3 className="record-diagnosis">{record.diagnosis || "N/A"}</h3>
                        <span className="record-date">{formatDate(record.date || record.createdAt)}</span>
                      </div>
                      <div className="record-body">
                        <p className="record-doctor">
                          Doctor: {record.doctor?.name || record.doctorName || "N/A"}
                        </p>
                        {record.notes && <p className="record-notes">{record.notes}</p>}
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
      {!Array.isArray(calendarEvents) || calendarEvents.length === 0 ? (
        <p className="empty-state">No calendar events found</p>
      ) : (
        <div className="calendar-events">
          {calendarEvents.map((event) => (
            <div
              key={event._id}
              className={`calendar-event event-${event.type || "default"}`}
            >
              <div className="event-marker"></div>

              <div className="event-content">
                <h4 className="event-title">
                  {event.title ||
                    event.medicineName ||
                    "Scheduled Event"}
                </h4>

                <p className="event-date">
                  {formatDate(
                    event.date ||
                    event.appointmentDate ||
                    event.reminderDate
                  )}
                  {event.time && ` at ${event.time}`}
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
                      key={notification.id}
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

      {/* Booking Modal */}
      {showBookingModal && selectedDoctor && (
        <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="modal-content modal-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Book Appointment</h2>
              <button onClick={() => setShowBookingModal(false)} className="modal-close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-doctor-info">
                <div>
                  <h3 className="modal-doctor-name">{selectedDoctor.name}</h3>
                  <p className="modal-doctor-specialty">
                    {selectedDoctor.specialization || selectedDoctor.specialty}
                  </p>
                </div>
              </div>

              <div className="booking-form">
                <div className="form-group">
                  <label>Select Date</label>
                  <input
                    type="date"
                    value={bookingForm.date}
                    onChange={(e) => handleDateChange(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div className="form-group">
                  <label>Select Time Slot</label>
                  {availableSlots.length > 0 ? (
                    <div className="slots-grid">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot._id}
                          disabled={slot.isBooked}
                          className={`slot-button ${
                            bookingForm.timeSlot === `${slot.startTime} - ${slot.endTime}`
                              ? "selected"
                              : ""
                          } ${slot.isBooked ? "disabled" : ""}`}
                          onClick={() =>
                            setBookingForm({
                              ...bookingForm,
                              timeSlot: `${slot.startTime} - ${slot.endTime}`
                            })
                          }
                        >
                          {slot.startTime} - {slot.endTime}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="empty-state">No slots available</p>
                  )}
                </div>

                <div className="form-group">
                  <label>Consultation Type</label>
                  <select
                    value={bookingForm.consultationType}
                    onChange={(e) => setBookingForm({ ...bookingForm, consultationType: e.target.value })}
                  >
                    <option value="in-person">In-Person</option>
                    <option value="virtual">Virtual</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Reason for Visit *</label>
                  <textarea
                    value={bookingForm.reason}
                    onChange={(e) => setBookingForm({ ...bookingForm, reason: e.target.value })}
                    placeholder="Describe your reason for the visit"
                    rows="4"
                  />
                </div>

                <button onClick={handleBookAppointment} className="primary-button" disabled={loading}>
                  {loading ? "Booking..." : "Confirm Appointment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
