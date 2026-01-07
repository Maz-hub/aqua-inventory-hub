/**
 * Home Page - Inventory Dashboard
 *
 * Main landing page after login showing two inventory sections:
 * - Gifts Inventory (accessible to all users)
 * - Apparel Inventory (restricted access - coming soon)
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function Home() {
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getGifts();
  }, []);

  const getGifts = () => {
    setLoading(true);

    api
      .get("/api/gifts/")
      .then((res) => res.data)
      .then((data) => {
        setGifts(data);
        console.log(data);
      })
      .catch((err) => alert(err))
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12">
        <h1 className="text-4xl font-bold text-wa-navy mb-2">
          Aqua Inventory Hub
        </h1>
        <p className="text-gray-600">
          Manage your inventory - Select a section below
        </p>
      </div>

      {/* Two Box Layout */}
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8">
        {/* Gifts Inventory Box */}
        <div
          onClick={() => navigate("/gifts")}
          className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-wa-blue"
        >
          <div className="text-center">
            <div className="text-6xl mb-4">🛍️</div>
            <h2 className="text-2xl font-bold text-wa-navy mb-3">
              Gifts / Office
            </h2>
            <p className="text-gray-600 mb-4">
              Gift items, office supplies, and branded merchandise
            </p>
            <div className="text-wa-blue font-semibold">
              {loading ? "Loading..." : `${gifts.length} items in stock`}
            </div>
          </div>
        </div>

        {/* Apparel Inventory Box */}
        <div className="bg-gray-200 rounded-lg shadow-lg p-8 cursor-not-allowed opacity-75">
          <div className="text-center">
            <div className="text-6xl mb-4">👕</div>
            <h2 className="text-2xl font-bold text-gray-600 mb-3">
              Apparel
            </h2>
            <p className="text-gray-500 mb-4">
              361° clothing for staff and events
            </p>
            <div className="text-gray-500 font-semibold">Coming Soon</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
