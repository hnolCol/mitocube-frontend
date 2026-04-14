import { createApiClient } from "./apiClient";

export const apiClient = createApiClient({
  baseURL: import.meta.env.VITE_API_URL,
  getToken: () => localStorage.getItem("token"),
});