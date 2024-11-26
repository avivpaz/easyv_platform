// services/authService.js
import api from './api';

export const authService = {
  async signup(formData) {
    const registrationData = {
      email: formData.email,
      password: formData.password,
      organizationName: formData.company,
      role: 'admin'
    };
    
    const response = await api.post('/auth/register', registrationData);
    return response.data;
  },

  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  async logout() {
    try {
      // Optional: Call backend logout endpoint if you have one
      // await api.post('/auth/logout');
      
      // Clear all auth data
      localStorage.clear();
      
      // Optional: Clear any API cache or reset API state
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }
};
