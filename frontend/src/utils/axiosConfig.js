import axios from 'axios';

// Create an Axios instance
const axiosInstance = axios.create({
    baseURL: 'https://your-api-base-url.com', // Replace with your API base URL
    timeout: 10000, // Request timeout
});

// Add a request interceptor to include the Authorization header
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken') || 'uakBngoqs7NrqSR1FnFrwF7JOamYAfQv---cQqpY2OA'; // Use fallback token if not found
        config.headers['Authorization'] = `Bearer ${token}`; // Attach token
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;
