import React from "react";
import { Navigate } from "react-router-dom";
import { getCurrentUser } from "../utils/storage";

interface ProtectedRouteProps {
  children: React.ReactNode;
}


export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
