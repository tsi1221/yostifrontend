import type { AxiosRequestConfig } from "axios";

import api from "../../lib/api";

const ApiService = (_config?: AxiosRequestConfig) => api;

export default ApiService;
