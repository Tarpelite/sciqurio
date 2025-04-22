import axios from 'axios';
import { API_URL } from '@/config';

export const getAuthToken = () => {
  try {
    const userInfoString = localStorage.getItem('user_info');
    if (!userInfoString) return null;
    const userInfo = JSON.parse(userInfoString);
    return userInfo.token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          console.error('Authentication error:', error.response.data);
          break;
        case 403:
          console.error('Authorization error:', error.response.data);
          break;
        case 404:
          console.error('Resource not found:', error.response.data);
          break;
        default:
          console.error('Server error:', error.response.data);
      }
      return Promise.reject({
        status: error.response.status,
        data: error.response.data,
        message: error.response.data?.message || 'An error occurred on the server'
      });
    } else if (error.request) {
      console.error('Network error - no response received:', error.request);
      return Promise.reject({
        status: 0,
        message: 'Network error - no response received'
      });
    } else {
      console.error('Request configuration error:', error.message);
      return Promise.reject({
        status: 0,
        message: error.message || 'Error setting up the request'
      });
    }
  }
);

export const api = {
  get: (url, config) => axiosInstance.get(url, config),
  post: (url, data, config) => axiosInstance.post(url, data, config),
  put: (url, data, config) => axiosInstance.put(url, data, config),
  delete: (url, config) => axiosInstance.delete(url, config),
  patch: (url, data, config) => axiosInstance.patch(url, data, config),
};
