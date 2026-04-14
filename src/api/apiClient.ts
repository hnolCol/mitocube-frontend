import axios from "axios";

export function createApiClient({ baseURL, getToken }) {
  const instance = axios.create({
    baseURL,
  });
  console.log(baseURL,"baseurl")
  // Attach token dynamically on every request
  instance.interceptors.request.use((config) => {
    const token = getToken?.();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  // Optional: response handling
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      // central error handling
      return Promise.reject(error);
    }
  );

  return instance;
}