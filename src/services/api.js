import axios from 'axios';
import config from '../config';
import storageService from './storageService';

const api = axios.create({
  baseURL: config.apiUrl
});

api.interceptors.request.use(
  (config) => {
    const token = storageService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      storageService.clearAll();
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;