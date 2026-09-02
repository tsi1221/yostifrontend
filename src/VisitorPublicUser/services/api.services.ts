// src/services/api.service.ts
import axios from "axios";
import type { AxiosRequestConfig } from "axios";
import { ACCESS_TOKEN } from "../constants";

const ApiService = (config?: AxiosRequestConfig) => {
  const instance = axios.create({
    baseURL: "http://localhost:5000",
    headers: {
      "Content-Type":
        config?.headers?.["Content-Type"] ?? "application/json",
    },
  });

  instance.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem(ACCESS_TOKEN);
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.clear();
        window.location.href = "/";
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export default ApiService;
