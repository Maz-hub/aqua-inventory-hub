/**
 * Reusable Form Component
 *
 * Handles both login and registration functionality.
 * Dynamically adjusts labels and API endpoints based on the 'method' prop.
 *
 * Props:
 * - route: API endpoint to send form data (/api/token/ or /api/user/register/)
 * - method: "login" or "register" - determines form behavior and labels
 */

import { useState } from "react";
// React hook for managing component state

import api from "../api";
// Pre-configured axios instance with authentication interceptor

import { useNavigate } from "react-router-dom";
// Hook for programmatic navigation after successful login/registration

import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
// localStorage key names for JWT tokens

function Form({ route, method }) {
  // Receives route (API endpoint) and method (login/register) as props

  const [username, setUsername] = useState("");
  // Tracks username input field value

  const [password, setPassword] = useState("");
  // Tracks password input field value

  const [loading, setLoading] = useState(false);
  // Tracks form submission state to prevent duplicate requests

  const navigate = useNavigate();
  // Router navigation function

  const name = method === "login" ? "Login" : "Register";
  // Dynamic label based on form purpose

  const handleSubmit = async (e) => {
    // Handles form submission - sends credentials to Django API

    setLoading(true);
    // Disables form during submission to prevent duplicate requests

    e.preventDefault();
    // Prevents default form submission (page reload)

    try {
      const res = await api.post(route, { username, password });
      // Sends POST request to either /api/token/ (login) or /api/user/register/

      if (method === "login") {
        // Login successful - store JWT tokens
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
        navigate("/");
        // Redirect to home page (protected route)
      } else {
        // Registration successful - redirect to login page
        navigate("/login");
      }
    } catch (error) {
      // API request failed (invalid credentials, network error, etc.)
      alert(error);
    } finally {
      setLoading(false);
      // Re-enable form regardless of success or failure
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h1 className="text-2xl font-bold text-center mb-6">{name}</h1>

        <input
          className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
        />

        <input
          className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />

        <button
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 cursor-pointer"
          type="submit"
          disabled={loading}
        >
          {loading ? "Loading..." : name}
        </button>
      </form>
    </div>
  );
}

export default Form;
