import axios from "axios";

// Axios instance with hardcoded backend URL
const api = axios.create({
  baseURL: "http://localhost:5000", // <-- hardcoded backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ===============================
// Types
// ===============================
export interface RegisterData {
  fullName: string;
  companyName?: string;
  country: string;
  phone: string;
  email: string;
  password: string;
  accountType: "individual" | "business" | "supplier" | "logistics";
  languagePreference?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
}

export interface User {
  gender: string;
  profileImage: string;
  _id: string;
  fullName: string;
  companyName?: string;
  country: string;
  phone: string;
  email: string;
  accountType: string;
  languagePreference: string;
  createdAt: string;
  updatedAt: string;
}

// ===============================
// API Functions
// ===============================
export const registerUser = async (data: RegisterData) => {
  try {
    const response = await api.post("/api/auth/register", data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

export const loginUser = async (data: LoginData) => {
  try {
    const response = await api.post<LoginResponse>("/api/auth/login", data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get<{ success: boolean; data: User }>("/api/auth/me");
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

export default api;
