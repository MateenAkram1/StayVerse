import axios from "axios";
import { store } from "@/app/store";
import { clearAuth } from "@/features/auth/authSlice";

const base = import.meta.env.VITE_API_URL || "/api";

export const api = axios.create({ baseURL: base });

api.interceptors.request.use((config) => {
  const t = localStorage.getItem("sv_token");
  if (t) {
    // eslint-disable-next-line no-param-reassign
    config.headers.Authorization = `Bearer ${t}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      store.dispatch(clearAuth());
    }
    return Promise.reject(err);
  }
);
