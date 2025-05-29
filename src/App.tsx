import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { BudgetProvider } from './contexts/BudgetContext';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OnboardingWizard from './pages/OnboardingWizard';
import Dashboard from './pages/Dashboard';
import WeeklyTracker from './pages/WeeklyTracker';
import EMIPlanner from './pages/EMIPlanner';
import MonthlyReport from './pages/MonthlyReport';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <BudgetProvider>
          <div className="min-h-screen bg-background font-sans text-textPrimary">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/onboarding" element={
                <ProtectedRoute>
                  <OnboardingWizard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/weekly-tracker" element={
                <ProtectedRoute>
                  <WeeklyTracker />
                </ProtectedRoute>
              } />
              <Route path="/emi-planner" element={
                <ProtectedRoute>
                  <EMIPlanner />
                </ProtectedRoute>
              } />
              <Route path="/monthly-report" element={
                <ProtectedRoute>
                  <MonthlyReport />
                </ProtectedRoute>
              } />
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </BudgetProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;