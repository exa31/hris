// plugins/axios.ts
import axios, { AxiosError, type AxiosInstance } from "axios";

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();

  // SSR: forward cookie
  const headers = import.meta.server ? useRequestHeaders(["cookie"]) : {};

  // Use useCookie for consistent cookie handling
  const tokenCookie = useCookie("access_token", {
    maxAge: 86400, // 1 day
    path: "/",
    sameSite: "lax",
    secure: import.meta.env.PROD,
  });

  // 🔄 AUTO BASEURL - mengikuti parent domain
  let baseURL: string =
    String(config.public.apiBaseUrl) || "http://localhost:3000";
  if (import.meta.client && typeof window !== "undefined") {
    // Client-side: gunakan window.location.origin (otomatis ngikutin domain saat ini)
    baseURL = window.location.origin;
  } else if (import.meta.server) {
    // Server-side: gunakan host dari request headers
    const host = useRequestHeaders(["host"]).host || config.public.apiBaseUrl;
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    baseURL = `${protocol}://${host}`;
  }

  const api: AxiosInstance = axios.create({
    baseURL,
    withCredentials: true,
  });

  const setAuthHeader = (reqConfig: any, token: string) => {
    if (!reqConfig) return;
    if (!reqConfig.headers) reqConfig.headers = {};
    if (typeof reqConfig.headers.set === "function") {
      reqConfig.headers.set("Authorization", `Bearer ${token}`);
    } else {
      reqConfig.headers["Authorization"] = `Bearer ${token}`;
    }
  };

  // Shared refresh promise for all concurrent requests
  let refreshPromise: Promise<string> | null = null;

  // =========================
  // REQUEST INTERCEPTOR
  // =========================
  api.interceptors.request.use((config) => {
    // SSR: forward cookie
    if (import.meta.server) {
      config.withCredentials = true;
      if (headers.cookie) {
        config.headers = config.headers || {};
        config.headers.Cookie = headers.cookie;
      }
    } else {
      // Client: Authorization
      const token = tokenCookie.value;
      if (token) {
        setAuthHeader(config, token);
      }
    }

    return config;
  });

  // =========================
  // RESPONSE INTERCEPTOR
  // =========================
  api.interceptors.response.use(
    (response) => {
      // Unwrap data if it follows the BaseResponse pattern
      if (
        response.data &&
        response.data.success === true &&
        response.data.data !== undefined
      ) {
        return { ...response, data: response.data.data };
      }
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest: any = error.config;

      // Do not retry or refresh if:
      // - Not a 401 Unauthorized
      // - No config
      // - Already retried once
      // - Request is to auth endpoints
      if (
        !originalRequest ||
        error.response?.status !== 401 ||
        originalRequest._retry ||
        originalRequest.url?.includes("/api/auth/refresh") ||
        originalRequest.url?.includes("/api/auth/credentials") ||
        originalRequest.url?.includes("/api/auth/login")
      ) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = (async () => {
            try {
              const res = await axios.post(
                `${baseURL}/api/auth/refresh`,
                {},
                { withCredentials: true },
              );

              const newToken =
                res.data?.data?.accessToken ||
                res.data?.accessToken;

              if (!newToken) {
                throw new Error("No access token returned from refresh");
              }

              tokenCookie.value = newToken;
              return newToken;
            } catch (refreshErr) {
              tokenCookie.value = null;
              if (import.meta.client) {
                navigateTo("/login");
              }
              throw refreshErr;
            } finally {
              refreshPromise = null;
            }
          })();
        }

        const newToken = await refreshPromise;
        setAuthHeader(originalRequest, newToken);
        return api(originalRequest);
      } catch (err) {
        return Promise.reject(err);
      }
    },
  );

  return {
    provide: {
      axios: api,
    },
  };
});
