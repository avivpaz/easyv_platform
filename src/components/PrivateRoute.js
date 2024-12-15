// PrivateRoute.js
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    // You can replace this with your loading component
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Save the attempted URL and query parameters
    return (
      <Navigate 
        to="/login" 
        state={{ 
          from: location.pathname,
          search: location.search
        }}
        replace
      />
    );
  }

  return children;
};

export default PrivateRoute;