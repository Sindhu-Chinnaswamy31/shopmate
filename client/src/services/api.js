import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api'
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const getProducts = () => API.get('/products');
export const getProductById = (id) => API.get(`/products/${id}`);
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const createPaymentOrder = (data) => API.post('/payment/create-order', data);
export const verifyPayment = (data) => API.post('/payment/verify', data);
export const getMyOrders = () => API.get('/payment/my-orders');
export const getDashboard = () => API.get('/admin/dashboard');
export const adminGetProducts = () => API.get('/admin/products');
export const adminAddProduct = (data) => API.post('/admin/products', data);
export const adminUpdateProduct = (id, data) => API.put(`/admin/products/${id}`, data);
export const adminDeleteProduct = (id) => API.delete(`/admin/products/${id}`);
export const adminGetOrders = () => API.get('/admin/orders');
export const adminUpdateOrder = (id, data) => API.put(`/admin/orders/${id}`, data);
export const adminGetUsers = () => API.get('/admin/users');
export const getReviews = (productId) => API.get(`/reviews/${productId}`);
export const addReview = (productId, data) => API.post(`/reviews/${productId}`, data);
export const deleteReview = (reviewId) => API.delete(`/reviews/${reviewId}`);
export const getProfile = () => API.get('/auth/profile');
export const updateProfile = (data) => API.put('/auth/profile', data);
export const applyCoupon = (data) => API.post('/coupons/apply', data);
export const adminGetCoupons = () => API.get('/coupons');
export const adminCreateCoupon = (data) => API.post('/coupons', data);
export const adminUpdateCoupon = (id, data) => API.put(`/coupons/${id}`, data);
export const adminDeleteCoupon = (id) => API.delete(`/coupons/${id}`);
export const getAddresses = () => API.get('/addresses');
export const addAddress = (data) => API.post('/addresses', data);
export const updateAddress = (id, data) => API.put(`/addresses/${id}`, data);
export const deleteAddress = (id) => API.delete(`/addresses/${id}`);
export const setDefaultAddress = (id) => API.put(`/addresses/${id}/default`);
export const getNotifications = () => API.get('/notifications');
export const markAsRead = (id) => API.put(`/notifications/${id}/read`);
export const markAllAsRead = () => API.put('/notifications/read-all');
export const deleteNotification = (id) => API.delete(`/notifications/${id}`);
export const broadcastNotification = (data) => API.post('/notifications/broadcast', data);
export const getRelatedProducts = (id) => API.get(`/products/${id}/related`);
export const subscribeStockAlert = (id) => API.post(`/products/${id}/stock-alert`);

export default API;