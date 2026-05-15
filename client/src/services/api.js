import axios from "axios";

const resolvedBaseURL = import.meta.env.VITE_API_URL || "/api";

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
