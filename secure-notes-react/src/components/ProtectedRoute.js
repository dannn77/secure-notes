import React from "react";
import { Navigate } from "react-router-dom";
import { useMyContext } from "../store/ContextApi";

const ProtectedRoute = ({ children, adminPage }) => {
  const { token, isAdmin } = useMyContext();

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (token && adminPage && !isAdmin) {
    return <Navigate to="/access-denied" />;
  }

  return children;
};

export default ProtectedRoute;
