/**
 * Gifts Inventory Page
 *
 * Displays all promotional items and office supplies.
 * Features:
 * - Grid/list view of all gifts
 * - Category filtering
 * - Add/Edit/Delete functionality
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function Gifts() {
  // Main component function for Gifts Inventory page

  const [gifts, setGifts] = useState([]);
  // State: Stores array of gift objects fetched from Django backend
  // Initially empty array, populated after API call completes

  const [loading, setLoading] = useState(true);
  // State: Tracks loading status during API requests
  // true = fetching data, false = data loaded or error occurred
  // Initially true because we fetch data immediately on component mount

  const navigate = useNavigate();
  // Hook from React Router for programmatic navigation
  // Used to redirect user (e.g., back to home page)

  useEffect(() => {
    // Side effect hook: Runs after component renders
    // Empty dependency array [] means this runs ONCE when component first mounts
    getGifts();
    // Immediately fetch gifts data when page loads
  }, []);

  const getGifts = () => {
    // Fetches all gifts from Django backend API

    api
      .get("/api/gifts/")
      // Sends GET request to /api/gifts/ endpoint
      // 'api' instance automatically includes JWT token in Authorization header
      // Backend validates token and returns gifts data

      .then((res) => res.data)
      // First .then: Extracts data property from response object
      // Response structure: { data: [...gifts], status: 200, headers: {...} }
      // We only need the data array

      .then((data) => {
        // Second .then: Handles the extracted data
        setGifts(data);
        // Updates gifts state with fetched array of gift objects

        setLoading(false);
        // Stops loading indicator - data successfully loaded
      })

      .catch((err) => {
        // Error handler: Catches any failures (network error, 401 unauthorized, 500 server error, etc.)
        alert(err);
        // Shows error message to user (will improve this UI later)

        setLoading(false);
        // Stops loading indicator even on error
        // Prevents infinite loading state if request fails
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading gifts...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <button
          onClick={() => navigate("/")}
          className="mb-4 text-wa-blue hover:text-wa-ocean flex items-center gap-2"
        >
          ← Back to Home
        </button>

        <h1 className="text-4xl font-bold text-wa-navy mb-2">
          Gifts Inventory
        </h1>
        <p className="text-gray-600">{gifts.length} items in stock</p>
      </div>

      {/* Temporary: Display gifts as JSON */}
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow">
        {gifts.length === 0 ? (
          <p className="text-center text-gray-500">
            No gifts in inventory yet. Add your first item!
          </p>
        ) : (
          <pre className="text-sm overflow-auto">
            {JSON.stringify(gifts, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

export default Gifts;
