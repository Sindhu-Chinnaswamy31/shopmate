import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api",
});

// Automatically attach token to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const getProducts = () => API.get("/products");
export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => API.post("/auth/login", data);
export const createPaymentOrder = (data) =>
  API.post("/payment/create-order", data);
export const verifyPayment = (data) => API.post("/payment/verify", data);
export const getProductById = (id) => API.get(`/products/${id}`);
export const getDashboard = () => API.get("/admin/dashboard");
export const adminGetProducts = () => API.get("/admin/products");
export const adminAddProduct = (data) => API.post("/admin/products", data);
export const adminUpdateProduct = (id, data) =>
  API.put(`/admin/products/${id}`, data);
export const adminDeleteProduct = (id) => API.delete(`/admin/products/${id}`);
export const adminGetOrders = () => API.get("/admin/orders");
export const adminUpdateOrder = (id, data) =>
  API.put(`/admin/orders/${id}`, data);
export const adminGetUsers = () => API.get("/admin/users");
export const getMyOrders = () => API.get("/payment/my-orders");

export default API;
