import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { ChatProvider } from './contexts/ChatContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { NavigationProvider } from './contexts/NavigationContext';
import { BrandingProvider } from './contexts/BrandingContext';

import LandingPage from './components/Landing/LandingPage';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ChatLayout from './components/Chat/ChatLayout';
import SettingsPage from './components/Settings/SettingsPage';
import OnboardingLayout from './components/Onboarding/OnboardingLayout';
import AdminLayout from './components/Admin/AdminLayout';
import RouteGuard from './components/Navigation/RouteGuard';
import LinearNavigationExample from './components/Navigation/LinearNavigationExample';
import { LogoShowcase } from './components/Branding';
import BackgroundVideo from './components/Common/BackgroundVideo';

import './App.css';

// Background video path (you can replace this with your actual video)
const backgroundVideoPath = '/videos/background.mp4';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

// Public route component (redirect to chat if already logged in)
const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to="/chat" /> : children;
};

function App() {
  return (
    <Router>
      <BrandingProvider>
        <ThemeProvider>
          <NotificationProvider>
            <NavigationProvider>
              <AuthProvider>
                <SocketProvider>
                  <ChatProvider>
                    <RouteGuard>
                      <BackgroundVideo videoSrc={backgroundVideoPath}>
                        <div className="App">
                          <Routes>
                            {/* Logo Showcase Route */}
                            <Route path="/logos" element={<LogoShowcase />} />
                            
                            {/* Dual Sidebar Test Route */}
                            <Route path="/test-sidebar" element={
                              <ProtectedRoute>
                                <div style={{ padding: '20px' }}>
                                  <h1>Dual Sidebar Test</h1>
                                  <p>This page tests the Telegram-style dual-sidebar functionality.</p>
                                  <div style={{ marginTop: '20px' }}>
                                    <a href="/chat" style={{ 
                                      padding: '10px 20px', 
                                      backgroundColor: '#10b981', 
                                      color: 'white', 
                                      textDecoration: 'none', 
                                      borderRadius: '5px' 
                                    }}>
                                      Go to Chat (Test Dual Sidebar)
                                    </a>
                                  </div>
                                </div>
                              </ProtectedRoute>
                            } />
                            
                            {/* Linear Navigation Demo Route */}
                            <Route path="/demo/navigation" element={
                              <ProtectedRoute>
                                <div style={{ padding: '20px' }}>
                                  <LinearNavigationExample />
                                </div>
                              </ProtectedRoute>
                            } />
                            
                            <Route path="/" element={
                              <PublicRoute>
                                <LandingPage />
                              </PublicRoute>
                            } />
                            <Route path="/login" element={
                              <PublicRoute>
                                <Login />
                              </PublicRoute>
                            } />
                            <Route path="/register" element={
                              <PublicRoute>
                                <Register />
                              </PublicRoute>
                            } />
                            <Route
                              path="/onboarding/*"
                              element={
                                <ProtectedRoute>
                                  <OnboardingLayout />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/admin/*"
                              element={
                                <ProtectedRoute>
                                  <AdminLayout />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/settings"
                              element={
                                <ProtectedRoute>
                                  <SettingsPage />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/chat/*"
                              element={
                                <ProtectedRoute>
                                  <ChatLayout />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/*"
                              element={
                                <ProtectedRoute>
                                  <Navigate to="/chat" replace />
                                </ProtectedRoute>
                              }
                            />
                          </Routes>
                          <ToastContainer />
                        </div>
                      </BackgroundVideo>
                    </RouteGuard>
                  </ChatProvider>
                </SocketProvider>
              </AuthProvider>
            </NavigationProvider>
          </NotificationProvider>
        </ThemeProvider>
      </BrandingProvider>
    </Router>
  );
}

export default App;
