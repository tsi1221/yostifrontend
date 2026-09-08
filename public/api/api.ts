// src/api/api.ts
import axios from "axios";

// Create an Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://yosti.nedhigibe.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ===============================
// Register User
// ===============================
export const registerUser = async (data: { name: string; email: string; password: string }) => {
  try {
    const response = await api.post("/auth/register", data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

// ===============================
// Login User
// ===============================
export const loginUser = async (data: { email: string; password: string }) => {
  try {
    const response = await api.post("/auth/login", data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};
