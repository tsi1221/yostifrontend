import api, { API_BASE_URL, readApiError } from "../../lib/api";

export { API_BASE_URL };

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

export const registerUser = async (data: RegisterData) => {
  try {
    const response = await api.post("/auth/register", data);
    return response.data;
  } catch (error) {
    throw readApiError(error, "Unable to register.");
  }
};

export const loginUser = async (data: LoginData) => {
  try {
    const response = await api.post<LoginResponse>("/auth/login", data);
    return response.data;
  } catch (error) {
    throw readApiError(error, "Unable to sign in.");
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get<{ success: boolean; data: User }>(
      "/users/me",
    );
    return response.data;
  } catch (error) {
    throw readApiError(error, "Unable to load the current user.");
  }
};

export default api;
