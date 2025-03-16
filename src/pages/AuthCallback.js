import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import storageService from '../services/storageService';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { setUser, setOrganization, login } = useAuth();
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('Processing authentication...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setStatus('Getting session data...');
        const result = await authService.handleAuthCallback();
        
        setStatus('Setting authentication state...');
        
        // Check if we have the necessary data
        if (!result || !result.accessToken || !result.user) {
          console.error('Missing data in auth result:', result);
          throw new Error('Authentication failed: Missing data');
        }
        
        // Use the login function from AuthContext to properly set everything
        await login({
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          user: result.user,
          organization: result.organization
        });
        
        setStatus('Authentication successful! Redirecting...');
        
        // Redirect to dashboard
        navigate('/dashboard');
      } catch (err) {
        console.error('Auth callback error:', err);
        setError(`Authentication failed: ${err.message || 'Unknown error'}`);
        setStatus('Authentication failed');
        
        // Clear any partial auth data
        storageService.clearAll();
        
        // Redirect to login after a delay
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    };

    handleCallback();
  }, [navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
        {error ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-gray-500">Redirecting to login page...</p>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-primary mb-4">Completing Authentication</h2>
            <div className="flex justify-center mb-4">
              <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-gray-600 mb-2">{status}</p>
            <p className="text-gray-500">Please wait while we complete your authentication...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback; 