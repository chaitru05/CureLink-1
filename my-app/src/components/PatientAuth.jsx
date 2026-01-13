"use client"

import { useState } from "react"
import "./AuthPage.css"
import { signInWithRedirect, getRedirectResult } from "firebase/auth";
import { useEffect } from "react";
import { GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";



export default function PatientAuth({ onRoleChange, onLogin }) {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  })

  const navigate = useNavigate();




useEffect(() => {
  
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      console.log("User detected:", user.email);

      const token = await user.getIdToken();

      await fetch("http://localhost:5000/api/users/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      console.log("Backend login successful");

      // ✅ REDIRECT HERE
      navigate("/patient-dashboard");
    }
  });

  return () => unsubscribe();
}, []);

  






  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const url = isLogin
      ? "http://localhost:5000/api/users/login"
      : "http://localhost:5000/api/users/register";

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
        };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Something went wrong");
      return;
    }

    console.log("Success:", data);
    onLogin(); // redirect to dashboard
    // navigate("/patient-dashboard");
  } catch (error) {
    console.error(error);
    alert("Server error");
  }
};
const provider = new GoogleAuthProvider();


const handleGoogleLogin = async () => {
  console.log("Google button clicked");

  try {
    await signInWithRedirect(auth, provider);
    // navigate("/patient-dashboard");
  } catch (err) {
    alert("Google Sign-In Failed");
    console.error(err);
  }
};
// import { useState, useEffect } from "react"
// import "./AuthPage.css"


// import {
//   GoogleAuthProvider,
//   signInWithRedirect,
//   getRedirectResult
// } from "firebase/auth";
// import { auth } from "../firebase";
// import { useNavigate } from "react-router-dom";


// export default function PatientAuth() {
//   const [isLogin, setIsLogin] = useState(true)
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//     phone: "",
//   })

//   const navigate = useNavigate()
//   const provider = new GoogleAuthProvider()

  /* ================= GOOGLE REDIRECT RESULT ================= */
//   useEffect(() => {
//   const handleRedirect = async () => {
//     try {
//       const result = await getRedirectResult(auth);

//       if (result?.user) {
//         console.log("Google user:", result.user.email);

//         const token = await result.user.getIdToken();

//         await fetch("http://localhost:5000/api/users/google-login", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ token }),
//         });

//         // ✅ store role
//         localStorage.setItem("role", "patient");

//         // ✅ redirect
//         navigate("/patient-dashboard");
//       }
//     } catch (err) {
//       console.error("Redirect error:", err);
//     }
//   };

//   handleRedirect();
// }, [navigate]);
  // useEffect(() => {
  //   const handleRedirect = async () => {
  //     const result = await getRedirectResult(auth);

  //     if (result?.user) {
  //       console.log("✅ Google user:", result.user.email);

  //       // 🔥 MOST IMPORTANT LINE
  //       localStorage.setItem("role", "patient");

  //       navigate("/patient-dashboard");
  //     }
  //   };

  //   handleRedirect();
  // }, [navigate]);

  // const handleGoogleLogin = async () => {
  //   console.log("➡️ Google button clicked");
  //   await signInWithRedirect(auth, provider);
  // };


  // /* ================= EMAIL / PASSWORD ================= */
  // const handleInputChange = (e) => {
  //   setFormData({ ...formData, [e.target.name]: e.target.value })
  // }

  // const handleSubmit = async (e) => {
  //   e.preventDefault()

  //   try {
  //     const url = isLogin
  //       ? "http://localhost:5000/api/users/login"
  //       : "http://localhost:5000/api/users/register"

  //     const payload = isLogin
  //       ? {
  //           email: formData.email,
  //           password: formData.password,
  //         }
  //       : {
  //           name: formData.name,
  //           email: formData.email,
  //           password: formData.password,
  //           role: "patient",
  //         }

  //     const res = await fetch(url, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(payload),
  //     })

  //     const data = await res.json()

  //     if (!res.ok) {
  //       alert(data.message || "Login failed")
  //       return
  //     }

  //     // ✅ STORE ROLE + REDIRECT
  //     localStorage.setItem("role", "patient")
  //     navigate("/patient-dashboard")
      

  //   } catch (err) {
  //     console.error(err)
  //     alert("Server error")
  //   }
  // }

  /* ================= GOOGLE LOGIN ================= */


// const handleGoogleLogin = async () => {
//   try {
//     await signInWithRedirect(auth, provider);
//   } catch (err) {
//     console.error(err);
//     alert("Google Sign-In Failed");
//   }
// };


// const handleGoogleLogin = async () => {
//   console.log("Google button clicked");

//   try {
//     const result = await signInWithPopup(auth, provider);
//     const token = await result.user.getIdToken();

//     await fetch("http://localhost:5000/api/users/google-login", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ token }),
//     });

//   } catch (err) {
//     alert("Google Sign-In Failed");
//     console.error(err);
//   }
// };
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
        <span className="role-badge-text">Patient Portal</span>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Left Side - Hero Section */}
        <div className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              Your Health,
              <br />
              <span className="hero-highlight">Connected</span>
            </h1>
            <p className="hero-description">
              Experience seamless healthcare management with CureLink. Access your medical records, book appointments,
              and connect with healthcare providers all in one place.
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
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <h3 className="feature-title">24/7 Access</h3>
              <p className="feature-description">Manage your health anytime, anywhere</p>
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
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className="feature-title">Expert Care</h3>
              <p className="feature-description">Connect with certified professionals</p>
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
                <h2 className="form-title">{isLogin ? "Welcome back" : "Create your account"}</h2>
                <p className="form-subtitle">
                  {isLogin
                    ? "Enter your credentials to access your account"
                    : "Join CureLink to manage your healthcare journey"}
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
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input"
                    required={!isLogin}
                  />
                </div>
              )}

              <div className="form-field">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              {!isLogin && (
                <div className="form-field">
                  <label htmlFor="phone" className="form-label">
                    Phone Number
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
                {isLogin ? "Login to Your Account" : "Create Account"}
              </button>

              <div className="role-switcher-links">
                <p className="role-switcher-text">Login as:</p>
                <div className="role-links">
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
                  By signing up, you agree to our{" "}
                  <button type="button" className="terms-link">
                    Terms of Service
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
              <button
              type="button"
              className="social-button"
              onClick={handleGoogleLogin}
>
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
