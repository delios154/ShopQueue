import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'An error occurred';
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (error.response?.status >= 400 && error.response?.status < 500) {
      toast.error(message);
    } else {
      toast.error('Server error. Please try again later.');
    }
    
    return Promise.reject(error);
  }
);

export const auth = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
};

export const shops = {
  create: (shopData) => api.post('/shops', shopData),
  getMyShops: () => api.get('/shops/my-shops'),
  getById: (id) => api.get(`/shops/${id}`),
  getPublic: (id) => api.get(`/shops/${id}/public`),
  update: (id, data) => api.put(`/shops/${id}`, data),
  delete: (id) => api.delete(`/shops/${id}`),
};

export const queues = {
  create: (queueData) => api.post('/queues', queueData),
  getByShop: (shopId) => api.get(`/queues/shop/${shopId}`),
  getById: (id) => api.get(`/queues/${id}`),
  getStatus: (id) => api.get(`/queues/${id}/status`),
  update: (id, data) => api.put(`/queues/${id}`, data),
};

export const bookings = {
  create: (bookingData) => api.post('/bookings', bookingData),
  getByShop: (shopId, params) => api.get(`/bookings/shop/${shopId}`, { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  updateStatus: (id, data) => api.put(`/bookings/${id}/status`, data),
  delete: (id) => api.delete(`/bookings/${id}`),
};

export const analytics = {
  getDashboard: (shopId, period) => api.get(`/analytics/shop/${shopId}/dashboard`, { params: { period } }),
  getReports: (shopId, params) => api.get(`/analytics/shop/${shopId}/reports`, { params }),
};

export const feedback = {
  create: (feedbackData) => api.post('/feedback', feedbackData),
  getByShop: (shopId, params) => api.get(`/feedback/shop/${shopId}`, { params }),
  getSummary: (shopId) => api.get(`/feedback/shop/${shopId}/summary`),
  getForm: (bookingId) => api.get(`/feedback/booking/${bookingId}/form`),
};

export default api;