// components/GoogleCallback.js
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { integrationsService } from '../services/integrationsService';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      
      if (!code) {
        setError('No authorization code found');
        return;
      }

      try {
        // Check if this is an integration callback or regular auth
        if (state === 'gmail_integration') {
          // Handle Gmail integration
          const response = await integrationsService.connectGmail(code);
          // Navigate back to integrations page with success message
          navigate('/integrations', { 
            state: { 
              success: true, 
              message: 'Gmail successfully connected!' 
            }
          });
        } else {
          // Handle regular authentication
          const response = await authService.googleCallback(code);
          await login(response);
          // This will redirect to dashboard through your auth context
        }
      } catch (err) {
        console.error('Google callback error:', err);
        const errorMessage = err.response?.data?.error || 'Authentication failed';
        
        if (state === 'gmail_integration') {
          navigate('/integrations', { 
            state: { 
              error: `Failed to connect Gmail: ${errorMessage}` 
            }
          });
        } else {
          setError(errorMessage);
          navigate('/login', { 
            state: { 
              error: errorMessage 
            }
          });
        }
      }
    };

    handleCallback();
  }, [navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center space-x-4">
          <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-lg text-gray-700">
            {location.search.includes('state=gmail_integration') 
              ? 'Connecting Gmail...' 
              : 'Completing authentication...'}
          </span>
        </div>
      )}
    </div>
  );
};

export default GoogleCallback;