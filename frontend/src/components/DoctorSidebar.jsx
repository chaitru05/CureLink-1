export default function DoctorSidebar({ activeSection, setActiveSection, onLogout }) {
  const menuItems = [
    { id: "overview", label: "Dashboard", iconPath: "M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" },
    { id: "appointments", label: "My Appointments", iconPath: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
    { id: "availability", label: "Manage Availability", iconPath: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { id: "records", label: "Patient Records", iconPath: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    { id: "calendar", label: "Calendar", iconPath: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { id: "notifications", label: "Notifications", iconPath: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" },
  ]

  return (
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
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`nav-item ${activeSection === item.id ? "active" : ""}`}
          >
            <svg viewBox="0 0 24 24" fill="none" className="nav-icon" stroke="currentColor" strokeWidth="2">
              <path d={item.iconPath} />
            </svg>
            {item.label}
          </button>
        ))}
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
  )
}
