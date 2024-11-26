// services/storageService.js
const STORAGE_KEYS = {
  TOKEN: 'cvAnalyzer_token',
  USER: 'cvAnalyzer_user',
  ORGANIZATION: 'cvAnalyzer_organization'
};

const storageService = {
  setToken(token) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  },

  getToken() {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  setUser(user) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  getUser() {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  },

  setOrganization(org) {
    localStorage.setItem(STORAGE_KEYS.ORGANIZATION, JSON.stringify(org));
  },

  getOrganization() {
    const org = localStorage.getItem(STORAGE_KEYS.ORGANIZATION);
    return org ? JSON.parse(org) : null;
  },

  clearAll() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.ORGANIZATION);
    // Or use localStorage.clear() to clear everything
  }
};

export default storageService;