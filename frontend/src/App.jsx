/**
 * Main App Component
 *
 * Defines the application's routing structure using React Router.
 * Handles navigation between public pages (login) and protected pages (home/inventory).
 *
 * Routes:
 * - / (home) - Protected route requiring authentication
 * - /login - Public login page
 * - /logout - Clears tokens and redirects to login
 * - * (catch-all) - 404 not found page
 */

import react from "react";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// React Router components for client-side routing

import Login from "./pages/Login";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Gifts from "./pages/Gifts";
import Apparel from "./pages/Apparel";
import NewRequest from "./pages/NewRequest";
import RequestConfirmation from "./pages/RequestConfirmation";
import MyRequests from "./pages/MyRequests";
import AdminPanel from "./pages/AdminPanel";
// Page components

import ProtectedRoute from "./components/ProtectedRoute";
// Wrapper component that enforces authentication

import { UserProvider } from "./context/UserContext";
import { SelectionProvider } from "./context/SelectionContext";

function Logout() {
  // Logout functionality: clears all stored tokens and redirects to login
  localStorage.clear();
  // Removes all items from localStorage (access token, refresh token)

  return <Navigate to="/login" />;
  // Redirects user to login page
}


function App() {
  return (
    <SelectionProvider>
    <UserProvider>
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

        <Route
          path="/apparel"
          element={
            <ProtectedRoute>
              <Apparel />
            </ProtectedRoute>
          }
        />

        <Route
          path="/requests/new"
          element={
            <ProtectedRoute>
              <NewRequest />
            </ProtectedRoute>
          }
        />

        <Route
          path="/requests/confirmation"
          element={
            <ProtectedRoute>
              <RequestConfirmation />
            </ProtectedRoute>
          }
        />

        <Route
          path="/requests/mine"
          element={
            <ProtectedRoute>
              <MyRequests />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-panel"
          element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          }
        />

        <Route path="/login" element={<Login />} />
        {/* Public login page - accessible without authentication */}

        <Route path="/logout" element={<Logout />} />
        {/* Logout route - clears tokens and redirects to login */}

        <Route path="/register" element={<Navigate to="/login" />} />
        {/* Registration disabled — accounts created by Admin via Django Admin */}

        <Route path="*" element={<NotFound />} />
        {/* Catch-all route for undefined paths (404 page) */}
        {/* Must be last route - matches anything not caught by routes above */}
      </Routes>
    </BrowserRouter>
    </UserProvider>
    </SelectionProvider>
  );
}

export default App;
