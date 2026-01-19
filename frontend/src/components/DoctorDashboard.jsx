import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axiosInstance from "../api/axiosInstance"
import DoctorSidebar from "./DoctorSidebar"
import "./DoctorDashboard.css"
import { Calendar, momentLocalizer } from "react-big-calendar"
import moment from "moment"
import "react-big-calendar/lib/css/react-big-calendar.css"



export default function DoctorDashboard() {
  const localizer = momentLocalizer(moment)
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
  prescriptions: [
    {
      medicineName: "",
      dosage: "",
      times: [{ time: "" }],
      durationInDays: "",
      startDate: ""
    }
  ]
})


const [selectedAppointment, setSelectedAppointment] = useState(null)


  // Calendar
  const [calendarEvents, setCalendarEvents] = useState([])
  const calendarData = calendarEvents.map(ev => {
  const [start, end] = ev.time.split("-")

  const startDate = moment(ev.date)
    .set({
      hour: parseInt(start.split(":")[0]),
      minute: parseInt(start.split(":")[1])
    })
    .toDate()

  const endDate = moment(ev.date)
    .set({
      hour: parseInt(end.split(":")[0]),
      minute: parseInt(end.split(":")[1])
    })
    .toDate()

  return {
    title: ev.title,
    start: startDate,
    end: endDate
  }
})

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

// ✅ Load Availability for selected date
const loadAvailability = async (date) => {
  try {
    const res = await axiosInstance.get(`/doctors/availability`)

    const day = res.data.find(
      a => new Date(a.date).toISOString().split("T")[0] === date
    )

    if (day) {
      setAvailableSlots(day.slots)
    } else {
      setAvailableSlots([])
    }
  } catch (err) {
    console.error(err)
    setAvailableSlots([])
  }
}

  const handleDateChange = (date) => {
    setSelectedDate(date)
    loadAvailability(date)
  }

const handleAddSlot = async () => {
  if (!newSlot.startTime || !newSlot.endTime) {
    setError("Please provide both start and end time")
    return
  }

  try {
    setLoading(true)
    setError(null)

    const response = await axiosInstance.put("/doctors/availability", {
      date: selectedDate,
      slot: {
        startTime: newSlot.startTime,
        endTime: newSlot.endTime
      }
    })

    if (response.status === 200 && response.data.success) {
      // reload slots from DB (single source of truth)
      loadAvailability(selectedDate)
      setNewSlot({ startTime: "", endTime: "" })
    } else {
      setError("Slot was not added")
    }

  } catch (err) {
    setError(err.response?.data?.message || "Failed to add time slot")
  } finally {
    setLoading(false)
  }
}



// ✅ Remove a slot for selected date
const handleRemoveSlot = async (slotId) => {
  try {
    setLoading(true)
    setError(null)

    // Remove the selected slot from the slots of this date
    const updatedSlots = availableSlots.filter((slot) => slot._id !== slotId && slot.id !== slotId)
    await updateDoctorAvailability(updatedSlots, selectedDate) // Pass date here!

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
      const res = await axiosInstance.get("/appointments/doctor")
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

  const handleOpenRecordModal = (appointment) => {
  setSelectedPatient(appointment.patientId)
  setSelectedAppointment(appointment)

  setRecordForm({
    diagnosis: "",
    symptoms: "",
    prescriptions: [
      {
        medicineName: "",
        dosage: "",
        times: [{ time: "" }],
        durationInDays: "",
        startDate: ""
      }
    ]
  })

  setShowRecordModal(true)
}


  const handleSubmitRecord = async () => {
  if (!recordForm.diagnosis || !recordForm.symptoms) {
    setError("Diagnosis and Symptoms are required")
    return
  }

  if (!selectedAppointment?._id) {
    setError("Appointment reference missing")
    return
  }

  try {
    setLoading(true)
    setError(null)

    await axiosInstance.post("/medical-records", {
      patientId: selectedAppointment.patientId._id || selectedAppointment.patientId,
      appointmentId: selectedAppointment._id,
      diagnosis: recordForm.diagnosis,
      symptoms: recordForm.symptoms,
      prescriptions: recordForm.prescriptions.map(p => ({
        medicineName: p.medicineName,
        dosage: p.dosage,
        times: p.times,
        durationInDays: Number(p.durationInDays),
        startDate: p.startDate
      }))
    })

    setShowRecordModal(false)
    setSelectedPatient(null)
    setSelectedAppointment(null)

    setRecordForm({
      diagnosis: "",
      symptoms: "",
      prescriptions: []
    })

  } catch (err) {
    console.error(err)
    setError(err.response?.data?.message || "Failed to create medical record")
  } finally {
    setLoading(false)
  }
  }

  const loadCalendar = async () => {
  try {
    setLoading(true)
    setError(null)

    const res = await axiosInstance.get("/calendar/doctor")

    const events = res.data.appointments.map(app => ({
      title: "Appointment",
      date: app.appointmentDate,
      time: app.timeSlot,
      type: "appointment"
    }))

    setCalendarEvents(events)

  } catch (err) {
    console.error("Error loading calendar:", err)
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

  const formatDate = (date) => {
  if (!date) return "N/A"

  const d = new Date(date)
  if (isNaN(d.getTime())) return "N/A"

  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric"
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
                              {appointment.patientId?.name || "Patient"}
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
                            <p className="detail-value">{formatDate(appointment.appointmentDate)}</p>
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
                            <h3 className="patient-name">{patient.patientId?.name  || patient.fullName || "Patient"}</h3>
                            <p className="patient-email">{patient.patientId?.email || "N/A"}</p>
                            <p >
                              {patient.reasonForVisit || "N/A"}
                            </p>
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
        <button onClick={() => setShowRecordModal(false)} className="modal-close">✕</button>
      </div>

      <div className="modal-body">
        <div className="modal-patient-info">
          <h3>Patient: {selectedPatient.name}</h3>
        </div>

        {/* Diagnosis */}
        <div className="form-group">
          <label>Diagnosis *</label>
          <input
            type="text"
            value={recordForm.diagnosis}
            onChange={(e) =>
              setRecordForm({ ...recordForm, diagnosis: e.target.value })
            }
          />
        </div>

        {/* Symptoms */}
        <div className="form-group">
          <label>Symptoms *</label>
          <textarea
            rows="3"
            value={recordForm.symptoms}
            onChange={(e) =>
              setRecordForm({ ...recordForm, symptoms: e.target.value })
            }
          />
        </div>

        {/* Prescriptions */}
        <h4>Prescriptions</h4>

        {recordForm.prescriptions.map((p, index) => (
          <div key={index} className="prescription-box">

            <input
              type="text"
              placeholder="Medicine Name"
              value={p.medicineName}
              onChange={(e) => {
                const updated = [...recordForm.prescriptions]
                updated[index].medicineName = e.target.value
                setRecordForm({ ...recordForm, prescriptions: updated })
              }}
            />

            <input
              type="text"
              placeholder="Dosage (e.g. 500mg)"
              value={p.dosage}
              onChange={(e) => {
                const updated = [...recordForm.prescriptions]
                updated[index].dosage = e.target.value
                setRecordForm({ ...recordForm, prescriptions: updated })
              }}
            />

            <input
              type="number"
              placeholder="Duration (days)"
              value={p.durationInDays}
              onChange={(e) => {
                const updated = [...recordForm.prescriptions]
                updated[index].durationInDays = e.target.value
                setRecordForm({ ...recordForm, prescriptions: updated })
              }}
            />

            <input
              type="date"
              value={p.startDate}
              onChange={(e) => {
                const updated = [...recordForm.prescriptions]
                updated[index].startDate = e.target.value
                setRecordForm({ ...recordForm, prescriptions: updated })
              }}
            />

            {/* Times */}
            <input
              type="text"
              placeholder="Times (comma separated e.g. 08:00, 20:00)"
              value={p.times.map(t => t.time).join(",")}
              onChange={(e) => {
                const updated = [...recordForm.prescriptions]
                updated[index].times = e.target.value
                  .split(",")
                  .map(t => ({ time: t.trim() }))
                setRecordForm({ ...recordForm, prescriptions: updated })
              }}
            />
          </div>
        ))}

        {/* Add another medicine */}
        <button
          className="secondary-button"
          onClick={() =>
            setRecordForm({
              ...recordForm,
              prescriptions: [
                ...recordForm.prescriptions,
                {
                  medicineName: "",
                  dosage: "",
                  times: [{ time: "" }],
                  durationInDays: "",
                  startDate: ""
                }
              ]
            })
          }
        >
          + Add Medicine
        </button>

        <button
          onClick={handleSubmitRecord}
          className="primary-button"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Record"}
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  )
}
