import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - redirect to login
          localStorage.removeItem('token');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          toast.error('Session expired. Please log in again.');
          break;
          
        case 403:
          // Forbidden
          toast.error('You do not have permission to perform this action.');
          break;
          
        case 404:
          // Not found
          toast.error('Requested resource not found.');
          break;
          
        case 422:
          // Validation error
          if (data.errors) {
            // Show validation errors
            Object.values(data.errors).forEach(errorArray => {
              if (Array.isArray(errorArray)) {
                errorArray.forEach(err => toast.error(err));
              } else {
                toast.error(errorArray);
              }
            });
          } else {
            toast.error(data.message || 'Validation failed.');
          }
          break;
          
        case 429:
          // Too many requests
          toast.error('Too many requests. Please try again later.');
          break;
          
        case 500:
        case 502:
        case 503:
        case 504:
          // Server errors
          toast.error('Server error. Please try again later.');
          break;
          
        default:
          // Other errors
          toast.error(data.message || 'Something went wrong.');
      }
    } else if (error.request) {
      // Network error
      toast.error('Network error. Please check your connection.');
    } else {
      // Other errors
      toast.error('An unexpected error occurred.');
    }
    
    return Promise.reject(error);
  }
);

export default api;