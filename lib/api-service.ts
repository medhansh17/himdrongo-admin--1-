import axios from "axios";
import { getCookie, setCookie, deleteCookie } from "./cookies";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getCookie("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getCookie("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        const response = await axios.post(`${API_BASE_URL}/api/admin/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        setCookie("accessToken", accessToken);
        setCookie("refreshToken", newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        deleteCookie("accessToken");
        deleteCookie("refreshToken");
        window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const apiService = {
  login: (email: string, password: string) =>
    api.post("/api/admin/login", { email, password }),

  refreshToken: (refreshToken: string) =>
    api.post("/api/admin/refresh", { refreshToken }),

  logout: (refreshToken: string) =>
    api.post("/api/admin/logout", { refreshToken }),

  getProfile: () => api.get("/api/admin/profile"),

  getPendingVerifications: () =>
    api.get("/api/admin/documents/pending-verifications"),

  getDriverDetails: (driverId: string) =>
    api.get(`/api/admin/documents/driver/${driverId}`),

  verifyPersonalInfo: (driverId: string, verified: boolean, reason?: string) =>
    api.post(`/api/admin/documents/verify-personal-info/${driverId}`, {
      verified,
      reason,
    }),

  verifyPersonalDocuments: (driverId: string, data: any) =>
    api.post(
      `/api/admin/documents/verify-personal-documents/${driverId}`,
      data
    ),

  verifyVehicleDetails: (
    driverId: string,
    verified: boolean,
    reason?: string
  ) =>
    api.post(`/api/admin/documents/verify-vehicle-details/${driverId}`, {
      verified,
      reason,
    }),

  verifyBankDetails: (driverId: string, verified: boolean, reason?: string) =>
    api.post(`/api/admin/documents/verify-bank-details/${driverId}`, {
      verified,
      reason,
    }),

  verifyEmergencyDetails: (
    driverId: string,
    verified: boolean,
    reason?: string
  ) =>
    api.post(`/api/admin/documents/verify-emergency-details/${driverId}`, {
      verified,
      reason,
    }),

  verifyAll: (driverId: string, data: any) =>
    api.post(`/api/admin/documents/verify-all/${driverId}`, data),

  getStatistics: () => api.get("/api/admin/documents/statistics"),

  searchDrivers: (query: string, status?: string, page = 1, limit = 20) =>
    api.get("/api/admin/documents/search", {
      params: { query, status, page, limit },
    }),
};
