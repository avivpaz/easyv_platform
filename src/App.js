// App.js
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import JobDetail from './pages/JobDetail';
import PrivateRoute from './components/PrivateRoute';
import Header from './components/Header';
import SettingsPage from './pages/SettingsPage';
import BillingPage from './pages/BillingPage';
import { GoogleOAuthProvider } from '@react-oauth/google';
import TawkToChat from './components/TawkToChat';

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
            path="/signup" 
            element={
              !isAuthenticated ? (
                <Signup />
              ) : (
                <Navigate to="/dashboard" />
              )
            } 
          />
          {/* Allow Dashboard access without PrivateRoute wrapper */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Keep other routes protected */}
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
    </div>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <Router>
        <AuthProvider>
          <AppRoutes />
          {/* <TawkToChat /> */}

        </AuthProvider>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;