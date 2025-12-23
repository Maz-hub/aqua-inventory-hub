import axios from "axios";
// HTTP client library for making API requests to Django backend

import { ACCESS_TOKEN } from "./constants";
// Import the localStorage key name for the access token

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

export default api;
// Exports the configured axios instance for use throughout the app
// Import in other files: import api from "./api"
