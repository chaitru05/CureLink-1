"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "../api/axiosInstance"
import "./AuthPage.css"

export default function PatientAuth({ onRoleChange }) {
  const navigate = useNavigate()

  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  })

  /* ================= INPUT ================= */
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  /* ================= AUTH ================= */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

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
            role: "patient"
          }

      const url = isLogin ? "/auth/login" : "/auth/register"

      const { data } = await axios.post(url, payload)

      // 🔐 SAFETY CHECK (VERY IMPORTANT)
      if (!data.token) {
        throw new Error("JWT token missing from backend response")
      }

      localStorage.setItem("token", data.token)
      localStorage.setItem("role", "patient")
      localStorage.setItem("user", JSON.stringify(data.user))

      navigate("/patient-dashboard")

    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || err.message || "Authentication failed")
    } finally {
      setLoading(false)
    }
  }

  /* ================= UI ================= */
  return (
    <div className="auth-container">
      <div className="form-card">

        {/* Toggle */}
        <div className="toggle-wrapper">
          <button
            onClick={() => setIsLogin(true)}
            className={isLogin ? "active" : ""}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={!isLogin ? "active" : ""}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">

          {!isLogin && (
            <input
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          )}

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Please wait..." : isLogin ? "Login" : "Create Account"}
          </button>
        </form>

        {/* Role Switch */}
        <p className="role-switcher">
          Login as:
          <span onClick={() => onRoleChange("doctor")}> Doctor </span> |
          <span onClick={() => onRoleChange("admin")}> Admin </span>
        </p>

      </div>
    </div>
  )
}
