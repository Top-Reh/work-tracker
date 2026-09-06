import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { EmailLinkGate } from '@/components/EmailLinkGate/EmailLinkGate';
import { ProtectedRoute, OnboardingRoute } from '@/components/ProtectedRoute';
import { Login } from '@/pages/Login/Login';
import { Register } from '@/pages/Register/Register';
import { CompleteProfile } from '@/pages/CompleteProfile/CompleteProfile';
import { Dashboard } from '@/pages/Dashboard/Dashboard';
import { Statistics } from '@/pages/Statistics/Statistics';
import { Settings } from '@/pages/Settings/Settings';

export default function App() {
  return (
    <ToastProvider>
      <EmailLinkGate>
        <AuthProvider>
          <HashRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/complete-profile"
                element={
                  <OnboardingRoute>
                    <CompleteProfile />
                  </OnboardingRoute>
                }
              />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/statistics"
                element={
                  <ProtectedRoute>
                    <Statistics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </HashRouter>
        </AuthProvider>
      </EmailLinkGate>
    </ToastProvider>
  );
}
