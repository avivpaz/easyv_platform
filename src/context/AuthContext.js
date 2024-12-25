import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import storageService from '../services/storageService';
import WelcomePopup from '../components/WelcomePopup';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const accessToken = storageService.getAccessToken();
        const refreshToken = storageService.getRefreshToken();
        const storedUser = storageService.getUser();
        const storedOrg = storageService.getOrganization();

        if (accessToken && refreshToken && storedUser) {
          setUser(storedUser);
          setOrganization(storedOrg);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        storageService.clearAll();
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  const login = async (authData) => {
    try {
      // Store tokens separately
      storageService.setAuthData({
        accessToken: authData.accessToken,
        refreshToken: authData.refreshToken,
        user: authData.user,
        organization: authData.organization
      });
      
      setUser(authData.user);
      setOrganization(authData.organization);

      if (authData.organization?.needsSetup) {
        setShowWelcomePopup(true);
      }

      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };


  const logout = async () => {
    try {
      storageService.clearAll();
      setUser(null);
      setOrganization(null);
      setShowWelcomePopup(false);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const updateOrganization = (updatedOrgData) => {
    const newOrgData = {
      ...organization,
      ...updatedOrgData,
      needsSetup: false
    };
    setOrganization(newOrgData);
    storageService.setOrganization(newOrgData);
  };

  const addCredits = (creditData) => {
    if (!creditData || typeof creditData.credits === 'undefined') {
      console.error('Invalid credit data received:', creditData);
      return;
    }

    const currentCredits = organization?.credits || 0;
    const creditsToAdd = parseInt(creditData.credits) || 0;
    
    const updatedOrg = {
      ...organization,
      credits: currentCredits + creditsToAdd
    };
    
    setOrganization(updatedOrg);
    storageService.setOrganization(updatedOrg);
  };

  const setCredits = (amount) => {
    if (amount == null || typeof amount !== 'number' || amount < 0) {
      throw new Error('Invalid deduction amount');
    }
    const updatedOrg = {
      ...organization,
      credits: amount,
      lastCreditUpdate: new Date().toISOString()
    };
    const currentCredits = organization?.credits || 0;

    setOrganization(updatedOrg);
    storageService.setOrganization(updatedOrg);

    return {
      success: true,
      previousCredits: currentCredits,
      newCredits: amount
      };
  };
  const value = {
    user,
    organization,
    login,
    logout,
    updateOrganization,
    isAuthenticated: !!(storageService.getAccessToken() && storageService.getRefreshToken()) && isInitialized,
    isLoading,
    addCredits,
    setCredits,
    isPro: organization?.plan === 'pro'
  };

  if (!isInitialized) {
    return null;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
      <WelcomePopup 
        isOpen={showWelcomePopup} 
        onClose={() => setShowWelcomePopup(false)}
        onSuccess={(updatedData) => {
          updateOrganization(updatedData);
          setShowWelcomePopup(false);
        }}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;