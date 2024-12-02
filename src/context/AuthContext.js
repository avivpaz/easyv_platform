// context/AuthContext.js
import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import storageService from '../services/storageService';
import WelcomePopup from '../components/WelcomePopup';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(storageService.getUser());
  const [organization, setOrganization] = useState(storageService.getOrganization());
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);

  const login = async (authData) => {
    storageService.setToken(authData.token);
    storageService.setUser(authData.user);
    storageService.setOrganization(authData.organization);
    
    setUser(authData.user);
    setOrganization(authData.organization);

    // Check if organization needs setup using the needsSetup flag
    if (authData.organization?.needsSetup) {
      setShowWelcomePopup(true);
    }

    navigate('/dashboard');
  };

  const logout = async () => {
    try {
      storageService.clearAll();
      setUser(null);
      setOrganization(null);
      setShowWelcomePopup(false); // Reset popup state on logout
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Update organization data after welcome popup submission
  const updateOrganization = (updatedOrgData) => {
    const newOrgData = {
      ...organization,
      ...updatedOrgData,
      needsSetup: false // Mark as setup complete
    };
    setOrganization(newOrgData);
    storageService.setOrganization(newOrgData);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      organization,
      login, 
      logout,
      updateOrganization,
      isAuthenticated: !!storageService.getToken(),
      isPro: organization?.plan === 'pro'
    }}>
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

export const useAuth = () => useContext(AuthContext);

export default AuthContext;