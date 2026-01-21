"use client"

import { useState } from "react"
import "./AuthPage.css"
import { useNavigate } from "react-router-dom"
import axios from "../api/axiosInstance"

export default function DoctorAuth({ onRoleChange }) {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    specialization: "",
    experience: ""
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
            role: "doctor",
            specialization: formData.specialization,
            experience: Number(formData.experience)
          }

      const url = isLogin ? "/auth/login" : "/auth/register"

      const { data } = await axios.post(url, payload)

      // ✅ STORE AUTH DATA
      localStorage.setItem("token", data.token)
      localStorage.setItem("role", "doctor")
      localStorage.setItem("user", JSON.stringify(data.user))

      navigate("/doctor-dashboard")

    } catch (err) {
      alert(err.response?.data?.message || "Doctor authentication failed")
    }
  }

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
        <span className="role-badge-text">Doctor Portal</span>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Left Side - Hero Section */}
        <div className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              Empower Your
              <br />
              <span className="hero-highlight">Practice</span>
            </h1>
            <p className="hero-description">
              Join CureLink's network of healthcare professionals. Manage your patients, schedule appointments, and
              streamline your practice with our comprehensive platform.
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
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <h3 className="feature-title">Smart Scheduling</h3>
              <p className="feature-description">Efficient appointment management</p>
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
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <h3 className="feature-title">Digital Records</h3>
              <p className="feature-description">Secure patient record management</p>
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
                <h2 className="form-title">{isLogin ? "Welcome back, Doctor" : "Join as a Doctor"}</h2>
                <p className="form-subtitle">
                  {isLogin
                    ? "Access your practice dashboard"
                    : "Register to start managing your practice with CureLink"}
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
                    placeholder="Dr. Jane Smith"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input"
                    required={!isLogin}
                  />
                </div>
              )}

              <div className="form-field">
                <label htmlFor="email" className="form-label">
                  Professional Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="doctor@hospital.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              {!isLogin && (
                <>
                  <div className="form-field">
                    <label htmlFor="specialization" className="form-label">
                      Specialization
                    </label>
                    <input
                      id="specialization"
                      name="specialization"
                      type="text"
                      placeholder="Cardiology, Pediatrics, etc."
                      value={formData.specialization}
                      onChange={handleInputChange}
                      className="form-input"
                      required={!isLogin}
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="licenseNumber" className="form-label">
                      Medical License Number
                    </label>
                    <input
                      id="licenseNumber"
                      name="licenseNumber"
                      type="text"
                      placeholder="MED-123456"
                      value={formData.licenseNumber}
                      onChange={handleInputChange}
                      className="form-input"
                      required={!isLogin}
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="phone" className="form-label">
                      Contact Number
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="form-input"
                      required={!isLogin}
                    />
                  </div>
                </>
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
                    Forgot password?
                  </button>
                </div>
              )}

              <button type="submit" className="submit-button">
                {isLogin ? "Access Dashboard" : "Register as Doctor"}
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
                      onRoleChange("admin")
                    }}
                    className="role-link"
                  >
                    Admin
                  </a>
                </div>
              </div>

              {!isLogin && (
                <p className="terms-text">
                  By registering, you agree to our{" "}
                  <button type="button" className="terms-link">
                    Professional Terms
                  </button>{" "}
                  and{" "}
                  <button type="button" className="terms-link">
                    Privacy Policy
                  </button>
                </p>
              )}
            </form>

            <div className="divider">
              <div className="divider-line"></div>
              <span className="divider-text">Or continue with</span>
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
};