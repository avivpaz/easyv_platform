import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import JobDetail from './pages/JobDetail';
import PrivateRoute from './components/PrivateRoute';
import Header from './components/Header';
import SettingsPage from './pages/SettingsPage';
import BrandingPage from './pages/BrandingPage';
import BillingPage from './pages/BillingPage';
import TawkToChat from './components/TawkToChat';
import AuthCallback from './pages/AuthCallback';
import GmailCallback from './pages/GmailCallback';
import HelpWidget from './components/HelpWidget';
import IntegrationsPage from './pages/IntegrationsPage';
import Sidebar from './components/Sidebar'
import React, { useState } from 'react';

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && <Sidebar onCollapse={setIsSidebarCollapsed} />}
      <main className={`min-h-screen ${isAuthenticated ? (isSidebarCollapsed ? 'md:ml-20' : 'md:ml-72') + ' pt-16 md:pt-0' : ''}`}>
        <Routes>
          <Route 
            path="/login" 
            element={
              !isAuthenticated ? (
                <Login />
              ) : (
                <Navigate to="/dashboard" />
              )
            } 
          />
          
          <Route 
            path="/auth/callback" 
            element={<AuthCallback />} 
          />
          
          <Route 
            path="/integrations/gmail/callback" 
            element={<GmailCallback />} 
          />
          
          <Route 
            path="/signup" 
            element={
              !isAuthenticated ? (
                <Signup />
              ) : (
                <Navigate to="/dashboard" />
              )
            } 
          />

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/integrations" element={
            <PrivateRoute>
              <IntegrationsPage />
            </PrivateRoute>
          } />

          <Route 
            path="/jobs/:id" 
            element={
              <PrivateRoute>
                <JobDetail />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/settings/*" 
            element={
              <PrivateRoute>
                <Routes>
                  <Route path="/" element={<SettingsPage />} />
                  <Route path="organization" element={<SettingsPage />} />
                </Routes>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/brand-kit" 
            element={
              <PrivateRoute>
              <BrandingPage/>
            </PrivateRoute>
            } 
          />
          <Route 
            path="/billing" 
            element={
              <PrivateRoute>
                <BillingPage/>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/upgrade" 
            element={
              <PrivateRoute>
                <div>Upgrade Plan Page</div>
              </PrivateRoute>
            } 
          />
          
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </main>
      {isAuthenticated && <HelpWidget />}
    </div>
  );
}

function App() {
  const paypalOptions = {
    clientId: process.env.REACT_APP_PAYPAL_CLIENT_ID,
    currency: "USD",
    intent: "capture",
    "enable-funding": "card,credit",
    "disable-funding": "paylater",
    "data-page-type": "product-details",
  };

  return (
    <Router>
      <AuthProvider>
        <PayPalScriptProvider options={paypalOptions}>
          <AppRoutes />
        </PayPalScriptProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;