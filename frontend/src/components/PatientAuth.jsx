"use client"

import { useState, useEffect } from "react"
import "./AuthPage.css"
import { useNavigate } from "react-router-dom"
import axios from "../api/axiosInstance"

// Optional Google Auth
import {
  GoogleAuthProvider,
  signInWithRedirect,
  onAuthStateChanged
} from "firebase/auth"
import { auth } from "../firebase"

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

  /* ================= EMAIL / PASSWORD ================= */
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

      // ✅ Save real backend data
      localStorage.setItem("token", data.token)
      localStorage.setItem("role", "patient")
      localStorage.setItem("user", JSON.stringify(data.user))

      navigate("/patient-dashboard")

    } catch (err) {
      alert(err.response?.data?.message || "Authentication failed")
    } finally {
      setLoading(false)
    }
  }

  /* ================= GOOGLE LOGIN ================= */
  const provider = new GoogleAuthProvider()

  const handleGoogleLogin = async () => {
    await signInWithRedirect(auth, provider)
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const firebaseToken = await user.getIdToken()

        const { data } = await axios.post("/auth/google-login", {
          token: firebaseToken
        })

        localStorage.setItem("token", data.token)
        localStorage.setItem("role", "patient")
        localStorage.setItem("user", JSON.stringify(data.user))

        navigate("/patient-dashboard")
      }
    })

    return () => unsubscribe()
  }, [navigate])

  /* ================= UI ================= */
  return (
    <div className="auth-container">
      <div className="form-card">

        {/* Toggle */}
        <div className="toggle-wrapper">
          <button onClick={() => setIsLogin(true)} className={isLogin ? "active" : ""}>
            Login
          </button>
          <button onClick={() => setIsLogin(false)} className={!isLogin ? "active" : ""}>
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

        {/* Google */}
        <button className="google-btn" onClick={handleGoogleLogin}>
          Continue with Google
        </button>

      </div>
    </div>
  )
}
