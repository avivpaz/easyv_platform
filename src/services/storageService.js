const SUPABASE_SESSION_KEY = 'supabase_session';

const storageService = {
  // Access Token
  getAccessToken() {
    return localStorage.getItem('accessToken');
  },

  setAccessToken(token) {
    localStorage.setItem('accessToken', token);
  },

  // Refresh Token
  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  },

  setRefreshToken(token) {
    localStorage.setItem('refreshToken', token);
  },

  // User Data
  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Organization Data
  getOrganization() {
    const org = localStorage.getItem('organization');
    return org ? JSON.parse(org) : null;
  },

  setOrganization(organization) {
    localStorage.setItem('organization', JSON.stringify(organization));
  },

  // Store all auth data at once
  setAuthData(data) {
    if (data.accessToken) this.setAccessToken(data.accessToken);
    if (data.refreshToken) this.setRefreshToken(data.refreshToken);
    if (data.user) this.setUser(data.user);
    if (data.organization) this.setOrganization(data.organization);
  },

  // Clear all stored data
  clearAll() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('organization');
    localStorage.removeItem(SUPABASE_SESSION_KEY);
  },

  setSupabaseSession(session) {
    if (!session) return;
    localStorage.setItem(SUPABASE_SESSION_KEY, JSON.stringify(session));
  },

  getSupabaseSession() {
    const sessionStr = localStorage.getItem(SUPABASE_SESSION_KEY);
    return sessionStr ? JSON.parse(sessionStr) : null;
  }
};

export default storageService;