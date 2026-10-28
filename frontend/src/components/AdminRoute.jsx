import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function AdminRoute() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Guests must log in before accessing protected pages.
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  // Logged-in customers must not access admin pages.
  if (user?.role !== "admin") {
    return <Navigate to="/account" replace />;
  }

  // Only administrators can render the nested route.
  return <Outlet />;
}

export default AdminRoute;