import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../services/supabaseClient';
import integrationsService from '../services/integrationsService';

const GmailCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get session from URL
        const { data, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (!data.session) {
          throw new Error('No session found');
        }
        
        // Get the access token from the session
        const { access_token, refresh_token } = data.session;
        
        // Connect Gmail using the tokens
        const result = await integrationsService.connectGmail({
          access_token,
          refresh_token
        });
        
        // Redirect to integrations page with success message
        navigate('/integrations', { 
          state: { 
            success: true, 
            message: 'Gmail connected successfully!' 
          } 
        });
      } catch (err) {
        console.error('Gmail callback error:', err);
        setError('Failed to connect Gmail. Please try again.');
        
        // Redirect to integrations page with error message
        setTimeout(() => {
          navigate('/integrations', { 
            state: { 
              success: false, 
              message: 'Failed to connect Gmail. Please try again.' 
            } 
          });
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
        {error ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Connection Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-gray-500">Redirecting to integrations page...</p>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-primary mb-4">Connecting Gmail</h2>
            <div className="flex justify-center mb-4">
              <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-gray-600">Please wait while we connect your Gmail account...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GmailCallback; 