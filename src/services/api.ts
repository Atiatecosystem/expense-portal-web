import axios from "axios";

/** Base Axios instance with interceptors */
const api = axios.create({
  baseURL: "/api",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

/* ── Request interceptor: attach token ── */
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem("atiat_user");
  if (stored) {
    try {
      const user = JSON.parse(stored);
      config.headers.Authorization = `Bearer mock-token-${user.id}`;
    } catch {
      /* ignore */
    }
  }
  return config;
});

/* ── Response interceptor: handle 401 ── */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("atiat_user");
      window.location.href = "/login";
    }
    return Promise.reject({
      message: error.response?.data?.message || error.message || "An error occurred",
      status: error.response?.status,
    });
  }
);

export default api;
