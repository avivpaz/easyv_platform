import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserCircle2, Building, ShareIcon } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const googleLogin = useGoogleLogin({
    flow: 'auth-code',
    ux_mode: 'redirect',
    select_account: true,
    redirect_uri: process.env.REACT_APP_GOOGLE_REDIRECT_URL,
    scope: 'email profile openid',  // Added openid scope
    access_type: 'offline', // Request refresh token
    prompt: 'consent',  // Force consent screen
    onError: error => {
      console.error('Google login error:', error);
      // More detailed error handling
      if (error.error === 'popup_closed_by_user') {
        setError('Login window was closed. Please try again.');
      } else if (error.error === 'access_denied') {
        setError('Permission to access Google account was denied.');
      } else {
        setError(`Authentication failed: ${error.error_description || error.error}`);
      }
      setLoading(false);
    },
    onNonOAuthError: error => {
      console.error('Non-OAuth error:', error);
      setError('An error occurred during authentication. Please ensure cookies are enabled and try again.');
      setLoading(false);
    }
  });

  const handleLoginClick = async () => {
    try {
      setLoading(true);
      setError('');
      await googleLogin();
    } catch (err) {
      console.error('Login handler error:', err);
      setError('Failed to initialize login. Please try again.');
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary-light p-12 text-white">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold mb-6">Your Perfect Hire in 2 Minutes!</h1>
          <p className="text-secondary-light text-lg mb-8">
            Sign in to craft professional job requirements, create a branded landing page, and start receiving qualified applicants today.
          </p>
          <div className="space-y-6">
            <div className="bg-white/10 rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="bg-white/10 p-3 rounded-lg">
                  <Building className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">One-Click Job Posts</h3>
                  <p className="text-secondary-light text-sm">
                    Just tell us a few words about the role, and we'll craft professional job requirements instantly
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="bg-white/10 p-3 rounded-lg">
                  <UserCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Streamlined Hiring</h3>
                  <p className="text-secondary-light text-sm">
                    From job description to candidate management, find your best hire faster
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="bg-white/10 p-3 rounded-lg">
                  <ShareIcon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Branded Landing Pages</h3>
                  <p className="text-secondary-light text-sm">
                    Get attractive, ready-to-share job posts that help you reach candidates across networks
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full space-y-8">
          {/* Logo and Title */}
          <div className="text-center">
            <div className="bg-primary w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
              <UserCircle2 className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-primary-dark mb-2">Get Started</h2>
            <p className="text-gray-500 mb-8">Use your Google account to continue</p>
          </div>

          {/* Error Message */}
          {error && (
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
          )}

          <button
            onClick={handleLoginClick}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>
          
          <div className="text-center text-sm text-gray-500">
            <p>
              By continuing, you agree to our{' '}
              <a href="https://www.rightcruiter.com/terms-of-use" className="text-primary hover:text-primary-dark underline">
                Terms of Use
              </a>
              {' '}and{' '}
              <a href="https://www.rightcruiter.com/privacy-policy" className="text-primary hover:text-primary-dark underline">
                Privacy Policy
              </a>
  
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;