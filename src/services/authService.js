import api from './api';
import storageService from './storageService';
import supabase from './supabaseClient';

export const authService = {
  async signup(formData) {
    try {
      // Send magic link instead of password signup
      const { data: authData, error: authError } = await supabase.auth.signInWithOtp({
        email: formData.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: formData.fullName,
            organization_name: formData.company,
            role: 'admin',
            is_new_user: true
          }
        }
      });

      if (authError) {
        throw authError;
      }

      // Return success message - user will need to check email
      return {
        success: true,
        message: 'Please check your email for a magic link to complete your registration.'
      };
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },

  async login(credentials) {
    try {
      // Send magic link instead of password login
      const { data: authData, error: authError } = await supabase.auth.signInWithOtp({
        email: credentials.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (authError) throw authError;

      // Return success message - user will need to check email
      return {
        success: true,
        message: 'Please check your email for a magic link to sign in.'
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async googleLogin() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth/callback'
        }
      });

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  },

  async handleAuthCallback() {
    try {
      // Get session from URL
      const { data: authData, error: authError } = await supabase.auth.getSession();
      
      if (authError) throw authError;
      
      if (!authData.session) {
        throw new Error('No session found');
      }
      
      console.log('Auth callback - session found:', authData.session.user.email);
      
      // Always try to create a new user first
      try {
        // Create organization in your backend for new users
        const userData = {
          email: authData.session.user.email,
          fullName: authData.session.user.user_metadata?.full_name || authData.session.user.email.split('@')[0],
          organizationName: authData.session.user.user_metadata?.organization_name || 'My Organization',
          role: authData.session.user.user_metadata?.role || 'admin',
          supabaseUserId: authData.session.user.id
        };
        
        console.log('Auth callback - attempting to register user:', userData.email);
        const response = await api.post('/auth/register-supabase', userData);
        console.log('Auth callback - registration successful');
        
        // Store the session
        storageService.setSupabaseSession(authData.session);
        
        // Store tokens separately for our app's auth system
        storageService.setAuthData({
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
          user: {
            email: userData.email,
            fullName: userData.fullName,
            role: userData.role
          },
          organization: response.data.organization
        });
        
        return {
          ...response.data,
          user: {
            email: userData.email,
            fullName: userData.fullName,
            role: userData.role
          }
        };
      } catch (registerError) {
        console.log('Auth callback - registration error:', registerError.message);
        
        // If the error is because the user already exists, try to log in
        if (registerError.response?.status === 409 || 
            registerError.response?.data?.error?.includes('already exists')) {
          
          console.log('Auth callback - user exists, attempting login');
          // Get user data from your backend for existing users
          const response = await api.post('/auth/login-supabase', { 
            supabaseUserId: authData.session.user.id 
          });
          
          console.log('Auth callback - login successful');
          
          // Store the session
          storageService.setSupabaseSession(authData.session);
          
          // Store tokens separately for our app's auth system
          storageService.setAuthData({
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
            user: response.data.user,
            organization: response.data.organization
          });
          
          return {
            ...response.data,
            user: response.data.user
          };
        }
        
        // If it's another error, rethrow it
        throw registerError;
      }
    } catch (error) {
      console.error('Auth callback error:', error);
      throw error;
    }
  },

  async logout() {
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear local storage
      storageService.clearAll();
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }
};

