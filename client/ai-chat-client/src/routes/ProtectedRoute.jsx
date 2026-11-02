import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ allowedRoles }) => {
  const location = useLocation();

  const { isAuthenticated, role } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(
      `${location.pathname}${location.search}`,
    );

    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  if (allowedRoles?.length > 0) {
    const isAllowed = allowedRoles.some((r) => r == role);

    if (!isAllowed) {
      return <Navigate to="/unauthorize" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
