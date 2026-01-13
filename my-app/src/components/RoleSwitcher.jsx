"use client"

import { useState } from "react"
import "./RoleSwitcher.css"

export default function RoleSwitcher({ currentRole, onRoleChange }) {
  const [isOpen, setIsOpen] = useState(false)

  const roles = [
    { value: "patient", label: "Patient", icon: "👤" },
    { value: "doctor", label: "Doctor", icon: "🩺" },
    { value: "admin", label: "Admin", icon: "⚙️" },
  ]

  const currentRoleData = roles.find((r) => r.value === currentRole)

  const handleRoleSelect = (role) => {
    onRoleChange(role)
    setIsOpen(false)
  }

  return (
    <div className="role-switcher">
      <button className="role-switcher-button" onClick={() => setIsOpen(!isOpen)}>
        <span className="role-icon">{currentRoleData.icon}</span>
        <span className="role-label">{currentRoleData.label}</span>
        <svg
          className={`chevron-icon ${isOpen ? "open" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="role-dropdown">
          {roles
            .filter((role) => role.value !== currentRole)
            .map((role) => (
              <button key={role.value} className="role-option" onClick={() => handleRoleSelect(role.value)}>
                <span className="role-icon">{role.icon}</span>
                <span className="role-label">{role.label}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  )
}
