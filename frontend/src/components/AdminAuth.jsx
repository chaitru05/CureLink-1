"use client"

import { useState } from "react"
import "./AuthPage.css"
import { useNavigate } from "react-router-dom"
import axios from "../api/axiosInstance"

export default function AdminAuth({ onRoleChange }) {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    adminCode: ""
  })

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const payload = isLogin
        ? {
            email: formData.email,
            password: formData.password
          }
        : {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: "admin"
          }

      const url = isLogin ? "/auth/login" : "/auth/register"

      const { data } = await axios.post(url, payload)

      // ✅ STORE JWT + ROLE
      localStorage.setItem("token", data.token)
      localStorage.setItem("role", "admin")
      localStorage.setItem("user", JSON.stringify(data.user))

      navigate("/admin-dashboard")

    } catch (err) {
      alert(err.response?.data?.message || "Admin authentication failed")
    }
  }

  /* ================= UI (UNCHANGED) ================= */
  return (
    <div className="auth-container">
      {/* Logo */}
      <div className="logo-wrapper">
        <div className="logo-content">
          <div className="logo-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="icon"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <span className="logo-text">
            Cure<span className="logo-highlight">Link</span>
          </span>
        </div>
      </div>

      <div className="role-badge">
        <span className="role-badge-text">Admin Portal</span>
      </div>

      <div className="main-content">
        <div className="hero-section">
          {/* 🔒 NO CHANGE */}
        </div>

        <div className="form-wrapper">
          <div className="form-card">

            {/* Toggle */}
            <div className="toggle-wrapper">
              <button
                onClick={() => setIsLogin(true)}
                className={`toggle-button ${isLogin ? "active" : ""}`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`toggle-button ${!isLogin ? "active" : ""}`}
              >
                Sign Up
              </button>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-header">
                <h2 className="form-title">{isLogin ? "Admin Access" : "Register Admin"}</h2>
                <p className="form-subtitle">
                  {isLogin ? "Secure administrative login" : "Create a new administrator account"}
                </p>
              </div>

              {!isLogin && (
                <div className="form-field">
                  <label className="form-label">Full Name</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
              )}

              <div className="form-field">
                <label className="form-label">Admin Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              {!isLogin && (
                <div className="form-field">
                  <label className="form-label">Admin Authorization Code</label>
                  <input
                    name="adminCode"
                    value={formData.adminCode}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
              )}

              <div className="form-field">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              {!isLogin && (
                <div className="form-field">
                  <label className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
              )}

              <button type="submit" className="submit-button">
                {isLogin ? "Access Admin Panel" : "Create Admin Account"}
              </button>

              <div className="role-switcher-links">
                <p className="role-switcher-text">Login as:</p>
                <div className="role-links">
                  <a href="#" onClick={(e) => { e.preventDefault(); onRoleChange("patient") }}>
                    Patient
                  </a>
                  <span className="role-separator">|</span>
                  <a href="#" onClick={(e) => { e.preventDefault(); onRoleChange("doctor") }}>
                    Doctor
                  </a>
                </div>
              </div>
            </form>

            <div className="divider">
              <div className="divider-line"></div>
              <span className="divider-text">Secure authentication</span>
              <div className="divider-line"></div>
            </div>

            <div className="social-buttons">
              <button type="button" className="social-button">
                Google
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
