import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 180000, // 3 minutes for analysis
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add API key from localStorage if available
    const apiKey = localStorage.getItem('gitgrade_api_key');
    if (apiKey) {
      config.headers['X-API-Key'] = apiKey;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export const api = {
  // Analyze repository
  analyzeRepository: async (repoUrl) => {
    const response = await apiClient.post('/analyze', { repoUrl });
    return response.data.data;
  },

  // Get analysis by ID
  getAnalysis: async (analysisId) => {
    const response = await apiClient.get(`/analysis/${analysisId}`);
    return response.data.data;
  },

  // Get analysis history
  getHistory: async (page = 1, limit = 10) => {
    const response = await apiClient.get(`/history?page=${page}&limit=${limit}`);
    return response.data.data;
  },

  // Get API key usage statistics
  getUsage: async () => {
    const response = await apiClient.get('/keys/usage');
    return response.data.data;
  },

  // Health check
  healthCheck: async () => {
    const response = await axios.get('http://localhost:5000/health');
    return response.data;
  },
};

export default apiClient;
