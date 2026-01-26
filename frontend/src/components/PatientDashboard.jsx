import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axiosInstance from "../api/axiosInstance"
import Sidebar from "./Sidebar"
import "./PatientDashboard.css"
import { Calendar, momentLocalizer } from "react-big-calendar"
import moment from "moment"
import "react-big-calendar/lib/css/react-big-calendar.css"



export default function PatientDashboard() {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState("overview")
  const [patientName, setPatientName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const localizer = momentLocalizer(moment)
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
  const fetchPatientName = async () => {
    try {
      const { data } = await axiosInstance.get("/auth/profile");
      setPatientName(data.name || "Patient");
    } catch (err) {
      setPatientName("Patient");
    }
  };

  fetchPatientName();
}, []);
  // Check authentication and role
  useEffect(() => {
  const checkPatientAuth = async () => {
    try {
      const { data } = await axiosInstance.get("/auth/profile");

      // role protection
      if (data.role !== "patient") {
        navigate("/");
      }
    } catch (err) {
      // not logged in
      navigate("/");
    }
  };

  checkPatientAuth();
}, []);

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
      console.log("Selected date:", date)
  
      // ✅ FIX: Find slots for the specific selected date, not just the first one
      if (Array.isArray(res.data) && res.data.length > 0) {
        // Convert selected date to match the format in the response (YYYY-MM-DD)
        const selectedDateStr = new Date(date).toISOString().split("T")[0]
        
        // Find the availability object that matches the selected date
        const matchingAvailability = res.data.find((availability) => {
          if (!availability.date) return false
          
          // Handle both Date objects and date strings
          const availabilityDate = new Date(availability.date)
          const availabilityDateStr = availabilityDate.toISOString().split("T")[0]
          
          return availabilityDateStr === selectedDateStr
        })
        
        if (matchingAvailability && matchingAvailability.slots) {
          // Filter out booked slots
          const availableSlots = matchingAvailability.slots.filter(slot => !slot.isBooked)
          setAvailableSlots(availableSlots)
          console.log("Found slots for selected date:", availableSlots)
        } else {
          console.log("No availability found for selected date:", selectedDateStr)
          setAvailableSlots([])
        }
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

    const appointmentEvents = res.data.appointments.map(a => ({
      title: "Doctor Appointment",
      date: a.appointmentDate,
      time: a.timeSlot,
      type: "appointment"
    }))

    const reminderEvents = res.data.reminders.map(r => ({
      title: `Medicine: ${r.medicineName}`,
      date: r.reminderDate,
      time: r.reminderTime,
      type: "medicine"
    }))

    setCalendarEvents([...appointmentEvents, ...reminderEvents])


  } catch (err) {
    console.error("Error loading calendar:", err)
    setCalendarEvents([])
  } finally {
    setLoading(false)
  }
}

  
  const calendarData = calendarEvents.map(ev => {
  // Default: all-day event
  let startDate = new Date(ev.date)
  let endDate = new Date(ev.date)

  // If time exists (appointments)
  if (ev.time && ev.time.includes("-")) {
    const [start, end] = ev.time.split("-").map(t => t.trim())

    const [sh, sm] = start.split(":")
    const [eh, em] = end.split(":")

    startDate = new Date(ev.date)
    startDate.setHours(Number(sh), Number(sm), 0)

    endDate = new Date(ev.date)
    endDate.setHours(Number(eh), Number(em), 0)
  } else {
    // All-day event (medicine reminders, etc.)
    startDate.setHours(9, 0, 0)
    endDate.setHours(9, 30, 0)
  }

  return {
    title: ev.title || "Event",
    start: startDate,
    end: endDate,
    allDay: !ev.time
  }
})


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

  const handleLogout = async () => {
  try {
    await axiosInstance.post("/auth/logout");
  } catch (err) {
    console.error("Logout failed", err);
  } finally {
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/");
  }
};

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
          <div className="doctor-image-wrapper">
            <div className="doctor-rating" title="Profile">
              <svg className="star-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span>Top</span>
            </div>
            <div className="doctor-avatar-initials">
              {(doctor.name || "D")
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((w) => w[0]?.toUpperCase())
                .join("")}
            </div>
          </div>
          <div className="doctor-info">
            <h3 className="doctor-name">{doctor.name}</h3>
            <p className="doctor-specialty">
              {doctor.specialization || doctor.specialty}
            </p>

            <div className="doctor-meta">
              <span className="doctor-experience">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2" />
                </svg>
                {(doctor.experience ?? 0)} yrs
              </span>
              {doctor.email && (
                <span className="doctor-pill" title={doctor.email}>
                  Email
                </span>
              )}
            </div>

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
                    {appointment.doctorId?.name ||
                      appointment.doctor?.name ||
                      appointment.doctorName ||
                      "Doctor"}
                  </h3>
                  <p className="appointment-doctor-specialty">
                    {appointment.doctorId?.specialization ||
                      appointment.doctor?.specialization ||
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
          <div key={medicine._id} className="medicine-card">
            <div className="medicine-info">
              <h3 className="medicine-name">
                {medicine.medicineName}
              </h3>

              <p className="medicine-dosage">
                Dosage: {medicine.dosage || "N/A"}
              </p>

              <p className="medicine-time">
                Time: {medicine.reminderTime}
              </p>
            </div>

            {!medicine.isTaken ? (
              <button
                onClick={() => handleMarkTaken(medicine._id)}
                className="medicine-button"
              >
                Mark as Taken
              </button>
            ) : (
              <span className="medicine-status-taken">✓ Taken</span>
            )}
          </div>
        ))
      )}
    </div>
  </div>
)}


          {/* Medical Records Section */}
          {/* Medical Records Section */}
{activeSection === "records" && (
  <div className="records-section-1">
    <div className="section-header-1">
      <h2 className="section-title-1">Medical Records</h2>
    </div>

    <div className="records-list-1">
      {medicalRecords.length === 0 ? (
        <p className="empty-state-1">No medical records found</p>
      ) : (
        medicalRecords.map((record) => (
          <div key={record._id} className="record-card-1">

            {/* Header */}
            <div className="record-header-1">
              <div>
                <h3 className="record-diagnosis-1">
                  {record.diagnosis || "N/A"}
                </h3>
                <p className="record-date-1">
                  {formatDate(record.createdAt)}
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="record-body-1">
              <p className="record-item-1">
                <strong>Symptoms:</strong> {record.symptoms || "N/A"}
              </p>

              <p className="record-item-1">
                <strong>Doctor:</strong>{" "}
                {record.doctorId?.name || "Doctor"}
              </p>

              <p className="record-item-1">
                <strong>Appointment ID:</strong>{" "}
                {record.appointmentId || "N/A"}
              </p>
            </div>

            {/* Prescriptions */}
            <div className="prescriptions-section-1">
              <h4 className="prescription-title-1">Prescriptions</h4>

              {record.prescriptions.length === 0 ? (
                <p className="empty-state-1">No prescriptions</p>
              ) : (
                record.prescriptions.map((med) => (
                  <div key={med._id} className="prescription-card-1">
                    <p className="prescription-item-1">
                      <strong>Medicine:</strong> {med.medicineName}
                    </p>
                    <p className="prescription-item-1">
                      <strong>Dosage:</strong> {med.dosage}
                    </p>
                    <p className="prescription-item-1">
                      <strong>Duration:</strong> {med.durationInDays} days
                    </p>
                    <p className="prescription-item-1">
                      <strong>Start Date:</strong>{" "}
                      {formatDate(med.startDate)}
                    </p>
                    <p className="prescription-item-1">
                      <strong>Times:</strong>{" "}
                      {med.times.map(t => t.time).join(", ")}
                    </p>
                  </div>
                ))
              )}
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
              <h2 className="section-title">Calendar</h2>

              <Calendar
                localizer={localizer}
                events={calendarData}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
              />
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
