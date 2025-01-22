import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { GoogleOAuthProvider } from '@react-oauth/google';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import JobDetail from './pages/JobDetail';
import PrivateRoute from './components/PrivateRoute';
import Header from './components/Header';
import SettingsPage from './pages/SettingsPage';
import BillingPage from './pages/BillingPage';
import TawkToChat from './components/TawkToChat';
import GoogleCallback from './components/GoogleCallback';
import HelpWidget from './components/HelpWidget';
import IntegrationsPage from './pages/IntegrationsPage';
import { AuthProvider } from "react-oidc-context";

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && <Header />}
      <div className={isAuthenticated ? 'pt-16' : ''}>
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
            path="/auth/google/callback" 
            element={<GoogleCallback />} 
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
      </div>
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
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <PayPalScriptProvider options={paypalOptions}>
        <Router>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </Router>
      </PayPalScriptProvider>
    </GoogleOAuthProvider>
  );
}

export default App;