import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";

import { API_URL } from "@/shared/config";
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
} from "@/shared/lib/session";

export const api = axios.create({ baseURL: API_URL });

// --- Запрос: подставляем access-токен -------------------------------------
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Ответ: единоразовый refresh при 401 ----------------------------------
let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  try {
    const { data } = await axios.post(`${API_URL}/auth/refresh/`, { refresh });
    setAccessToken(data.access);
    return data.access;
  } catch {
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };
    const isAuthCall = original?.url?.includes("/auth/");

    if (error.response?.status === 401 && original && !original._retry && !isAuthCall) {
      original._retry = true;
      // Single-flight: промис сбрасываем только после его завершения, иначе
      // параллельные 401 могут запустить повторный refresh.
      refreshing = refreshing ?? refreshAccessToken().finally(() => {
        refreshing = null;
      });
      const newToken = await refreshing;

      if (newToken) {
        original.headers = original.headers ?? {};
        (original.headers as Record<string, string>).Authorization = `Bearer ${newToken}`;
        return api(original);
      }

      // Refresh не удался — выходим.
      clearSession();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
