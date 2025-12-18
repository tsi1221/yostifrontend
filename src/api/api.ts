// src/api/api.ts
import axios from "axios";

// Create an Axios instance
const api = axios.create({
  baseURL: "http://localhost:5000", // Replace with your backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

// ===============================
// Register User
// ===============================
export const registerUser = async (data: {
  name: string;
  email: string;
  password: string;
}) => {
  const response = await api.post("/users/register", data);
  return response.data;
};

// ===============================
// Login User
// ===============================
export const loginUser = async (data: { email: string; password: string }) => {
  const response = await api.post("/users/login", data);
  return response.data;
};

// ===============================
// Example: Fetch Protected Resource
// ===============================
export const getProtectedData = async () => {
  const response = await api.get("/protected");
  return response.data;
};
