import React from 'react';
import { Route, Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem('token'); // or any other auth check logic

  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;
