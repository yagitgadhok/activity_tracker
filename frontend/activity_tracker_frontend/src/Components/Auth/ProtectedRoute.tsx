import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userRole = JSON.parse(localStorage.getItem('userRole') || '[]');

  // Check if the user is authenticated
  const isAuthenticated = !!token;

  // Check if the user has the required role (if specified)
  const hasRequiredRole = allowedRoles 
    ? allowedRoles.some(role => userRole.includes(role)) 
    : true;

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/" replace />;
  }

  if (!hasRequiredRole) {
    // Redirect to unauthorized page or dashboard if not authorized
    return <Navigate to="/unauthorized" replace />;
  }

  // Render the child routes if authenticated and authorized
  return <Outlet />;
};

export default ProtectedRoute;
