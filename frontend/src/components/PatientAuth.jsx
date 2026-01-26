"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axiosInstance from "../api/axiosInstance"
import "./AuthPage.css"

export default function PatientAuth({ onRoleChange }) {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

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
          };

      const url = isLogin ? "/auth/login" : "/auth/register";

      const { data } = await axiosInstance.post(url, payload);

      // ✅ OPTIONAL: store ONLY UI-safe data
      localStorage.setItem("role", "patient");
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/patient-dashboard");

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };


  /* ================= UI ================= */
//   return (
//     <div className="auth-container patient">
//       <div className="form-card">

//         {/* Toggle */}
//         <div className="toggle-wrapper">
//           <button
//             onClick={() => setIsLogin(true)}
//             className={isLogin ? "active" : ""}
//           >
//             Login
//           </button>
//           <button
//             onClick={() => setIsLogin(false)}
//             className={!isLogin ? "active" : ""}
//           >
//             Sign Up
//           </button>
//         </div>

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="auth-form">

//           {!isLogin && (
//             <input
//               name="name"
//               placeholder="Full Name"
//               value={formData.name}
//               onChange={handleInputChange}
//               required
//             />
//           )}

//           <input
//             name="email"
//             type="email"
//             placeholder="Email"
//             value={formData.email}
//             onChange={handleInputChange}
//             required
//           />

//           <input
//             name="password"
//             type="password"
//             placeholder="Password"
//             value={formData.password}
//             onChange={handleInputChange}
//             required
//           />

//           <button type="submit" disabled={loading}>
//             {loading ? "Please wait..." : isLogin ? "Login" : "Create Account"}
//           </button>
//         </form>

//         {/* Role Switch */}
//         <p className="role-switcher">
//           Login as:
//           <span onClick={() => onRoleChange("doctor")}> Doctor </span> |
//           <span onClick={() => onRoleChange("admin")}> Admin </span>
//         </p>

//       </div>
//     </div>
//   )
// }
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
            </div>
          </div>
        </div>
      </div> 
    </div>
  )
}
