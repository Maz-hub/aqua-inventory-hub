/**
 * Axios API Configuration
 *
 * Creates a pre-configured axios instance for all HTTP requests to the Django backend.
 *
 * Key Features:
 * - Centralized base URL management via environment variables
 * - Automatic JWT token injection for authenticated requests
 * - Request interceptor adds Authorization header to every API call
 *
 * Usage:
 * Import this configured instance instead of raw axios:
 *   import api from "./api"
 *   api.get("/api/gifts/")  // Automatically includes baseURL and auth token
 *
 * Benefits:
 * - DRY principle: Configure once, use everywhere
 * - Easy environment switching (development/production URLs)
 * - Automatic authentication without manual header management
 */

import axios from "axios";
// HTTP client library for making API requests to Django backend

import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants";

const api = axios.create({
  // Creates a customized axios instance with pre-configured settings
  // All requests made with this instance will use these default configurations

  baseURL: import.meta.env.VITE_API_URL,
  // Sets the base URL for all API requests from environment variable
  // Example: if VITE_API_URL = "http://localhost:8000"
  // then api.get("/api/gifts/") sends request to "http://localhost:8000/api/gifts/"
  // This allows different URLs for development vs production without code changes
});

api.interceptors.request.use(
  (config) => {
    // Intercepts every API request before it's sent to add authentication
    // This runs automatically for all requests made with the 'api' instance

    const token = localStorage.getItem(ACCESS_TOKEN);
    // Retrieves the JWT access token from browser's localStorage

    if (token) {
      // If token exists (user is logged in), add it to request headers
      config.headers.Authorization = `Bearer ${token}`;
      // Django expects: "Authorization: Bearer eyJhbGci..."
      // This allows backend to identify and authenticate the user
    }

    return config;
    // Returns the modified config so the request can proceed with auth header
  },
  (error) => {
    // Error handler for request interceptor
    // If something fails while setting up the request (before it's sent)
    return Promise.reject(error);
    // Passes the error forward so it can be caught by try/catch blocks
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem(REFRESH_TOKEN);

      if (refreshToken) {
        try {
          const { data } = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/token/refresh/`,
            { refresh: refreshToken }
          );
          localStorage.setItem(ACCESS_TOKEN, data.access);
          original.headers.Authorization = `Bearer ${data.access}`;
          return api(original);
        } catch {
          sessionStorage.setItem('session_expired', '1');
          localStorage.clear();
          window.location.href = "/login";
          return Promise.reject(error);
        }
      }

      localStorage.clear();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
