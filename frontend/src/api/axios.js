import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  withCredentials: true,
});

// Request interceptor to add auth token if needed (though we use http-only cookies)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('activeToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401s globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized
      console.log("Unauthorized, redirect to login");
    }
    return Promise.reject(error);
  }
);

export default api;
