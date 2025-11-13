import api from './api';

const authService = {
  // Login user
  async login(email, password) {
    const response = await api.post('/auth/login', {
      email,
      password
    });
    return response;
  },

  // Register user
  async register(name, email, password) {
    const response = await api.post('/auth/register', {
      name,
      email,
      password
    });
    return response;
  },

  // Get user profile
  async getProfile() {
    const response = await api.get('/auth/profile');
    return response;
  },

  // Update user profile
  async updateProfile(userData) {
    const response = await api.put('/auth/profile', userData);
    return response;
  },

  // Change password
  async changePassword(currentPassword, newPassword) {
    const response = await api.put('/auth/change-password', {
      currentPassword,
      newPassword
    });
    return response;
  },

  // Logout user
  async logout() {
    try {
      const response = await api.post('/auth/logout');
      return response;
    } catch (error) {
      // Even if logout fails on server, we still want to clear local token
      console.error('Logout error:', error);
      return { data: { message: 'Logged out locally' } };
    }
  },

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Get stored token
  getToken() {
    return localStorage.getItem('token');
  },

  // Set token in localStorage
  setToken(token) {
    localStorage.setItem('token', token);
  },

  // Remove token from localStorage
  removeToken() {
    localStorage.removeItem('token');
  }
};

export default authService;