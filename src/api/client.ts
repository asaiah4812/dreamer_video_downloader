import axios from 'axios';

import { API_CONFIG, getApiBaseUrl } from '@/constants/config';

export const apiClient = axios.create({
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl();
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ??
      error.response?.data?.error ??
      error.message ??
      'Network request failed';
    return Promise.reject(new Error(message));
  },
);
