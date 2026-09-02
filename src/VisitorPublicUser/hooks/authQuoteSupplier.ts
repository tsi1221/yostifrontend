// src/hooks/authQuoteSupplier.ts
import axios from "axios";

const API_BASE = "http://localhost:5000/api/sourcing";

// Helper to get token from localStorage (or your auth state)
const getToken = () => localStorage.getItem("token");

// Axios instance with auth header
const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add Bearer token
axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// -------------------- Hooks --------------------

// Get all quotes for the logged-in supplier
export const getSupplierQuotes = async () => {
  try {
    const res = await axiosInstance.get("/myquotes"); // your backend route
    return res.data; // array of SupplierQuote
  } catch (err: any) {
    throw err;
  }
};

// Send a reply to a specific quote/request
export const sendQuoteReply = async (requestId: string, payload: { message: string }) => {
  try {
    const res = await axiosInstance.post(`/${requestId}/quote`, payload);
    return res.data;
  } catch (err: any) {
    throw err;
  }
};
