import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import StoreSelect from "./pages/StoreSelect";
import QuickEntry from "./pages/QuickEntry";

const ProtectedRoute = ({ children }) => {
  const isAuth = localStorage.getItem("@acougue/isAuthenticated");
  if (!isAuth) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/cadastro" element={<Navigate to="/onboarding" replace />} />

        <Route path="/quick-entry" element={
          <ProtectedRoute><QuickEntry /></ProtectedRoute>
        } />

        <Route path="/store-select" element={
          <ProtectedRoute><StoreSelect /></ProtectedRoute>
        } />

        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
