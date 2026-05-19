import axios from "axios";

const normalizeBaseURL = (value) => {
  if (!value) {
    return "/api";
  }

  const trimmedValue = value.trim().replace(/\/+$/, "");

  if (!trimmedValue) {
    return "/api";
  }

  if (/^https?:\/\//i.test(trimmedValue)) {
    return trimmedValue.endsWith("/api") ? trimmedValue : `${trimmedValue}/api`;
  }

  if (trimmedValue === "/api" || trimmedValue.endsWith("/api")) {
    return trimmedValue;
  }

  return trimmedValue.startsWith("/")
    ? `${trimmedValue}/api`
    : `/${trimmedValue}/api`;
};

const resolvedBaseURL = normalizeBaseURL(import.meta.env.VITE_API_URL);

const api = axios.create({
  baseURL: resolvedBaseURL,
  timeout: 15000,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("hms_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthPage = ["/login", "/register"].includes(
      window.location.pathname,
    );

    if (error.response?.status === 401 && !isAuthPage) {
      localStorage.removeItem("hms_token");
      localStorage.removeItem("hms_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
