import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import CitizenDashboard from './components/CitizenDashboard';
import AgentDashboard from './components/AgentDashboard';
import WorkerDashboard from './components/WorkerDashboard';
import ComplaintForm from './components/ComplaintForm';
import ComplaintDetail from './components/ComplaintDetail';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <AppContent />
        </div>
      </Router>
    </AuthProvider>
  );
}

function AppContent() {
  const { user, isAuthenticated } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        <Route 
          path="/" 
          element={
            !isAuthenticated ? (
              <Login />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } 
        />
        <Route 
          path="/login" 
          element={
            !isAuthenticated ? (
              <Login />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } 
        />
        <Route 
          path="/register" 
          element={
            !isAuthenticated ? (
              <Register />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? (
              <Dashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="/report" 
          element={
            isAuthenticated && user?.role === 'citizen' ? (
              <ComplaintForm />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } 
        />
        <Route 
          path="/complaint/:id" 
          element={
            isAuthenticated ? (
              <ComplaintDetail />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
      </Routes>
    </>
  );
}

export default App;