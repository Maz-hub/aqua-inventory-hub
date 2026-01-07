/**
 * Main App Component
 *
 * Defines the application's routing structure using React Router.
 * Handles navigation between public pages (login, register) and protected pages (home/inventory).
 *
 * Routes:
 * - / (home) - Protected route requiring authentication
 * - /login - Public login page
 * - /logout - Clears tokens and redirects to login
 * - /register - Public registration page (clears any existing tokens first)
 * - * (catch-all) - 404 not found page
 */

import react from "react";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// React Router components for client-side routing

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Gifts from "./pages/Gifts";
// Page components

import ProtectedRoute from "./components/ProtectedRoute";
// Wrapper component that enforces authentication

function Logout() {
  // Logout functionality: clears all stored tokens and redirects to login
  localStorage.clear();
  // Removes all items from localStorage (access token, refresh token)

  return <Navigate to="/login" />;
  // Redirects user to login page
}

function RegisterAndLogout() {
  // Ensures clean registration by clearing any existing authentication tokens
  // Prevents conflicts if user was previously logged in
  localStorage.clear();

  return <Register />;
  // Renders the registration page
}

function App() {
  return (
    <BrowserRouter>
      {/* Enables client-side routing throughout the app */}

      <Routes>
        {/* Defines all application routes */}

        <Route
          path="/"
          element={
            <ProtectedRoute>
              {/* Home dashboard requires authentication */}
              {/* Shows two boxes: Gifts Inventory and Apparel Inventory */}
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/gifts"
          element={
            <ProtectedRoute>
              {/* Gifts inventory page requires authentication */}
              {/* Displays all promotional items with add/edit/delete functionality */}
              <Gifts />
            </ProtectedRoute>
          }
        />

        <Route path="/login" element={<Login />} />
        {/* Public login page - accessible without authentication */}

        <Route path="/logout" element={<Logout />} />
        {/* Logout route - clears tokens and redirects to login */}

        <Route path="/register" element={<RegisterAndLogout />} />
        {/* Public registration page - clears any existing tokens first */}

        <Route path="*" element={<NotFound />} />
        {/* Catch-all route for undefined paths (404 page) */}
        {/* Must be last route - matches anything not caught by routes above */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
