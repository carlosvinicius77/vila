import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import StoreSelect from "./pages/StoreSelect";

// Optional: Protected Route wrapper
// If someone visits /dashboard directly and is not logged in, they are redirected to /login.
// We also have this check inside Dashboard.jsx, but it's good practice to have it at the router level.
const ProtectedRoute = ({ children }) => {
  const isAuth = localStorage.getItem("@acougue/isAuthenticated");
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/cadastro" element={<Navigate to="/onboarding" replace />} />
        
        <Route 
          path="/store-select" 
          element={
            <ProtectedRoute>
              <StoreSelect />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
