import api from './api';
import storageService from './storageService';

export const authService = {
  async signup(formData) {
    const registrationData = {
      email: formData.email,
      password: formData.password,
      organizationName: formData.company,
      fullName: formData.fullName,
      role: 'admin'
    };
    
    const response = await api.post('/auth/register', registrationData);
    const { accessToken, refreshToken } = response.data;
    storageService.setAccessToken(accessToken, refreshToken);
    return response.data;
  },

  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    const { accessToken, refreshToken } = response.data;
    storageService.setAccessToken(accessToken, refreshToken);
    return response.data;
  },

  async googleLogin(googleToken) {
    const response = await api.post('/auth/google', { token: googleToken });
    const { accessToken, refreshToken } = response.data;
    storageService.setAccessToken(accessToken, refreshToken);
    return response.data;
  },

  // Updated to handle authorization code instead of token
  async googleCallback(code) {
    const response = await api.post('/auth/google/callback', { code });
    const { accessToken, refreshToken } = response.data;
    storageService.setAccessToken(accessToken, refreshToken);
    return response.data;
  },

  async logout() {
    try {
      storageService.clearAll();
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }
};

