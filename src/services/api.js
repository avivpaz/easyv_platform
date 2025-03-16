import axios from 'axios';
import config from '../config';
import storageService from './storageService';
import supabase from './supabaseClient';

const api = axios.create({
  baseURL: config.apiUrl
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  async (config) => {
    // First try to get token from our system
    const token = storageService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // If no token, try to get from Supabase session
      const supabaseSession = storageService.getSupabaseSession();
      if (supabaseSession?.access_token) {
        config.headers['Supabase-Auth'] = supabaseSession.access_token;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      // Try to refresh with our system first
      const refreshToken = storageService.getRefreshToken();
      
      if (refreshToken) {
        try {
          const response = await api.post('/auth/refresh', { refreshToken });
          const { accessToken } = response.data;
          
          storageService.setAccessToken(accessToken, refreshToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          processQueue(null, accessToken);
          
          return api(originalRequest);
        } catch (refreshError) {
          // If our refresh fails, try Supabase
          try {
            const { data, error } = await supabase.auth.refreshSession();
            if (error) throw error;
            
            if (data.session) {
              storageService.setSupabaseSession(data.session);
              originalRequest.headers['Supabase-Auth'] = data.session.access_token;
              processQueue(null, data.session.access_token);
              return api(originalRequest);
            }
          } catch (supabaseError) {
            processQueue(supabaseError, null);
            storageService.clearAll();
            window.location.href = '/login';
            return Promise.reject(supabaseError);
          }
        } finally {
          isRefreshing = false;
        }
      } else {
        // Try Supabase refresh
        try {
          const { data, error } = await supabase.auth.refreshSession();
          if (error) throw error;
          
          if (data.session) {
            storageService.setSupabaseSession(data.session);
            originalRequest.headers['Supabase-Auth'] = data.session.access_token;
            processQueue(null, data.session.access_token);
            isRefreshing = false;
            return api(originalRequest);
          }
          
          throw new Error('No session found');
        } catch (supabaseError) {
          processQueue(supabaseError, null);
          storageService.clearAll();
          window.location.href = '/login';
          return Promise.reject(supabaseError);
        } finally {
          isRefreshing = false;
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
