// context/AuthContext.js
import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import storageService from '../services/storageService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(storageService.getUser());
  const [organization, setOrganization] = useState(storageService.getOrganization());

  const login = async (authData) => {
    storageService.setToken(authData.token);
    storageService.setUser(authData.user);
    storageService.setOrganization(authData.organization);
    
    setUser(authData.user);
    setOrganization(authData.organization);
    navigate('/dashboard');
  };

  const logout = async () => {
    try {
      // Clear all storage
      storageService.clearAll();
      // Reset state
      setUser(null);
      setOrganization(null);
      // Navigate to login
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      organization,
      login, 
      logout,
      isAuthenticated: !!storageService.getToken(),
      isPro: organization?.plan === 'pro'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);