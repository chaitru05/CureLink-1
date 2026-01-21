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

      {/* Main Content */}
      <div className="main-content">
        {/* Left Side - Hero Section */}
        <div className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              System
              <br />
              <span className="hero-highlight">Management</span>
            </h1>
            <p className="hero-description">
              Administrative portal for CureLink. Manage users, monitor system health, and oversee all healthcare
              operations from a centralized dashboard.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon primary-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="icon"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 0v20M2 12h20" />
                </svg>
              </div>
              <h3 className="feature-title">Full Control</h3>
              <p className="feature-description">Complete system oversight</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon accent-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="icon"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              </div>
              <h3 className="feature-title">Analytics</h3>
              <p className="feature-description">Real-time system insights</p>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="form-wrapper">
          <div className="form-card">
            {/* Toggle Switch */}
            <div className="toggle-wrapper">
              <button onClick={() => setIsLogin(true)} className={`toggle-button ${isLogin ? "active" : ""}`}>
                Login
              </button>
              <button onClick={() => setIsLogin(false)} className={`toggle-button ${!isLogin ? "active" : ""}`}>
                Sign Up
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-header">
                <h2 className="form-title">{isLogin ? "Admin Access" : "Register Admin"}</h2>
                <p className="form-subtitle">
                  {isLogin ? "Secure administrative login" : "Create a new administrator account"}
                </p>
              </div>

              {!isLogin && (
                <div className="form-field">
                  <label htmlFor="name" className="form-label">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Admin Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input"
                    required={!isLogin}
                  />
                </div>
              )}

              <div className="form-field">
                <label htmlFor="email" className="form-label">
                  Admin Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@curelink.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              {!isLogin && (
                <div className="form-field">
                  <label htmlFor="adminCode" className="form-label">
                    Admin Authorization Code
                  </label>
                  <input
                    id="adminCode"
                    name="adminCode"
                    type="text"
                    placeholder="Enter admin authorization code"
                    value={formData.adminCode}
                    onChange={handleInputChange}
                    className="form-input"
                    required={!isLogin}
                  />
                </div>
              )}

              <div className="form-field">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              {!isLogin && (
                <div className="form-field">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="form-input"
                    required={!isLogin}
                  />
                </div>
              )}

              {isLogin && (
                <div className="forgot-password">
                  <button type="button" className="forgot-link">
                    Contact system administrator
                  </button>
                </div>
              )}

              <button type="submit" className="submit-button">
                {isLogin ? "Access Admin Panel" : "Create Admin Account"}
              </button>

              <div className="role-switcher-links">
                <p className="role-switcher-text">Login as:</p>
                <div className="role-links">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      onRoleChange("patient")
                    }}
                    className="role-link"
                  >
                    Patient
                  </a>
                  <span className="role-separator">|</span>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      onRoleChange("doctor")
                    }}
                    className="role-link"
                  >
                    Doctor
                  </a>
                </div>
              </div>

              {!isLogin && (
                <p className="terms-text">
                  Admin accounts require authorization.{" "}
                  <button type="button" className="terms-link">
                    Learn more
                  </button>
                </p>
              )}
            </form>

            <div className="divider">
              <div className="divider-line"></div>
              <span className="divider-text">Secure authentication</span>
              <div className="divider-line"></div>
            </div>

            <div className="social-buttons">
              <button type="button" className="social-button">
                <svg className="social-icon" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </button>                            
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
