import axios from "axios";

import { API_BASE_URL } from "../../lib/api";
const API_URL = `${API_BASE_URL}/requests`;

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getSourcingRequests = async () => {
  const res = await axiosInstance.get("/");
  return res.data.data || res.data; // Handles both {data: []} and direct array
};

export const getSourcingRequestById = async (id: string) => {
  const res = await axiosInstance.get(`/${id}`);
  return res.data.data || res.data;
};

export const updateSourcingRequest = async (id: string, data: any) => {
  const res = await axiosInstance.put(`/${id}`, data);
  return res.data;
};