import axios from "axios";

export const UNAUTHORIZED_EVENT = "mitocube-unauthorized";

const TOKEN_INVALID_DETAILS = [
  "Token expired. Please login again.",
  "Token not verified.",
  "Token invalid.",
  "The required user role is not matched.",
  "Could not validate credentials. User not found or password incorrect.",
  "User is blocked and cannot login."
];

export function createApiClient({ baseURL, getToken }) {
  const instance = axios.create({
    baseURL,
  });
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
      // If a request was made with a token and the backend rejects it as
      // unauthorized (e.g. expired or invalid token), notify the app so it can
      // log the user out and forward to the login page. Permission denials
      // (403) are regular errors and handled where the request is used.
      const status = error?.response?.status;
      const detail = error?.response?.data?.detail;
      if (status === 401 && getToken?.() && TOKEN_INVALID_DETAILS.includes(detail)) {
        window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT, { detail: { status } }));
      }
      // central error handling
      return Promise.reject(error);
    }
  );

  return instance;
}
