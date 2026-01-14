

import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const loggedInRole = localStorage.getItem("role");

  console.log("🔐 ProtectedRoute role:", loggedInRole);

  if (loggedInRole !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}

