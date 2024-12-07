// App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import JobDetail from './pages/JobDetail';
import PrivateRoute from './components/PrivateRoute';
import Header from './components/Header';
import SettingsPage from './pages/SettingsPage';
import ThankYou from './pages/ThankYou';
import { ModalProvider } from './context/ModalContext';

// Separate the routes component to use the auth hook
function AppRoutes() {
  const { isAuthenticated } = useAuth();

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
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/jobs/:id" 
            element={
              <PrivateRoute>
                <JobDetail />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <PrivateRoute>
                <SettingsPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/billing" 
            element={
              <PrivateRoute>
                <div>Billing Page</div>
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
          
            <Route 
            path="/thank-you" 
            element={
              <PrivateRoute>
                <ThankYou />
              </PrivateRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </div>
  );
}

// Main App component with correct provider order
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;