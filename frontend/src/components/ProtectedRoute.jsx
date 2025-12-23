/**
 * Protected Route Component
 * 
 * Wrapper component that protects routes requiring authentication.
 * Automatically checks JWT token validity and refreshes expired tokens.
 * Redirects to login page if authentication fails.
 * 
 * Usage:
 *   <ProtectedRoute>
 *     <InventoryPage />
 *   </ProtectedRoute>
 */

import { Navigate } from "react-router-dom";
// Handles redirection to login page when unauthorized

import { jwtDecode } from "jwt-decode";
// Decodes JWT tokens to check expiration timestamp

import api from "../api";
// Configured axios instance for API requests

import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";
// localStorage key names for JWT tokens

import { useState, useEffect } from "react";
// React hooks for state management and side effects


function ProtectedRoute({ children }) {
  // Wraps child components and only renders them if user is authenticated
  
  const [isAuthorized, setIsAuthorized] = useState(null);
  // null = checking authentication status
  // true = user is authorized
  // false = user is not authorized

  useEffect(() => {
    // Runs once when component mounts to check authentication
    auth().catch(() => setIsAuthorized(false))
  }, [])

  const refreshToken = async () => {
    // Attempts to get a new access token using the refresh token
    
    const refreshToken = localStorage.getItem(REFRESH_TOKEN);
    
    try {
      const res = await api.post("/api/token/refresh/", {
        refresh: refreshToken,
      });
      // Sends refresh token to backend to get new access token
      
      if (res.status === 200) {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        // Store new access token in localStorage
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    } catch (error) {
      console.log(error);
      setIsAuthorized(false);
      // If refresh fails, user must login again
    }
  };

  const auth = async () => {
    // Main authentication check logic
    
    const token = localStorage.getItem(ACCESS_TOKEN);
    
    if (!token) {
      // No token found - user needs to login
      setIsAuthorized(false);
      return;
    }
    
    const decoded = jwtDecode(token);
    // Decode token to read expiration timestamp
    
    const tokenExpiration = decoded.exp;
    // Token expiration time (Unix timestamp)
    
    const now = Date.now() / 1000;
    // Current time (Unix timestamp)

    if (tokenExpiration < now) {
      // Token expired - try to refresh it
      await refreshToken();
    } else {
      // Token still valid - authorize user
      setIsAuthorized(true);
    }
  };

  if (isAuthorized === null) {
    // Still checking authentication status
    return <div>Loading...</div>;
  }

  return isAuthorized ? children : <Navigate to="/login" />;
  // If authorized: render child components
  // If not authorized: redirect to login page
}

export default ProtectedRoute;