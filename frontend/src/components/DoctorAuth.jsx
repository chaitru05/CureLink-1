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
      <div className="role-badge">
        <span className="role-badge-text">Doctor Portal</span>
      </div>

      <div className="main-content">
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
                <label className="form-label">Email</label>
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
                <>
                  <div className="form-field">
                    <label className="form-label">Specialization</label>
                    <input
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">Experience (years)</label>
                    <input
                      type="number"
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                </>
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

            </form>

          </div>
        </div>
      </div>
    </div>
  )
}
