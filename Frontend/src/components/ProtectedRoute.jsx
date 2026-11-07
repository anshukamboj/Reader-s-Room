import { Navigate, Outlet } from "react-router-dom";
import { getToken } from "../api";

export default function ProtectedRoute({ role }) {
  const user = JSON.parse(localStorage.getItem("rr_user") || "null");

  if (!getToken() || !user) return <Navigate to="/login" replace />;

  if (user.role !== role)
    return <Navigate to={user.role === "librarian" ? "/librarian" : "/dashboard/overview"} replace />;

  return <Outlet />;
}