import axios from 'axios';

// Base URL for the backend API
const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
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

// Add response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 unauthorized errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication service object
export const authService = {
  // Register a new user
  register: async (username, email, password) => {
    try {
      const response = await apiClient.post('/auth/register', {
        username,
        email,
        password
      });
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Login user
  login: async (identifier, password) => {
    try {
      const response = await apiClient.post('/auth/login', {
        identifier,
        password
      });
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      const response = await apiClient.post('/auth/logout');
      return response.data;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  // Get current user information
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },

  // Get all users
  getAllUsers: async () => {
    try {
      const response = await apiClient.get('/auth/users');
      return response.data;
    } catch (error) {
      console.error('Get all users error:', error);
      throw error;
    }
  }
};

// Message service object
export const messageService = {
  // Get public messages
  getPublicMessages: async (page = 1, limit = 50) => {
    try {
      const response = await apiClient.get('/messages/public', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Get public messages error:', error);
      throw error;
    }
  },

  // Send a message
  sendMessage: async (content, messageType = 'text', isPrivate = false, recipientId = null) => {
    try {
      const response = await apiClient.post('/messages/send', {
        content,
        messageType,
        isPrivate,
        recipientId
      });
      return response.data;
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  },

  // Get private messages with a specific user
  getPrivateMessages: async (userId, page = 1, limit = 50) => {
    try {
      const response = await apiClient.get(`/messages/private/${userId}`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Get private messages error:', error);
      throw error;
    }
  },

  // Edit a message
  editMessage: async (messageId, content) => {
    try {
      const response = await apiClient.put(`/messages/${messageId}`, {
        content
      });
      return response.data;
    } catch (error) {
      console.error('Edit message error:', error);
      throw error;
    }
  },

  // Delete a message
  deleteMessage: async (messageId) => {
    try {
      const response = await apiClient.delete(`/messages/${messageId}`);
      return response.data;
    } catch (error) {
      console.error('Delete message error:', error);
      throw error;
    }
  }
};

// Export the configured axios instance for custom requests
export default apiClient;

