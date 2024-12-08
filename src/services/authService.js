// services/authService.js
import api from './api';

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
    return response.data;
  },

  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  async googleLogin(googleToken) {
    const response = await api.post('/auth/google', { token: googleToken });
    return response.data;
  },

  async logout() {
    try {
      localStorage.clear();
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }
};