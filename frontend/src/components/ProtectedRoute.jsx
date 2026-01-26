import { Navigate } from "react-router-dom"
import { useEffect, useState } from "react"
import axiosInstance from "../api/axiosInstance"

export default function ProtectedRoute({ role, children }) {
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await axiosInstance.get("/auth/profile")

        if (role && data.role !== role) {
          setAuthorized(false)
        } else {
          setAuthorized(true)
        }
      } catch (err) {
        setAuthorized(false)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [role])

  if (loading) return null // or loader

  if (!authorized) {
    return <Navigate to="/" replace />
  }

  return children
}
