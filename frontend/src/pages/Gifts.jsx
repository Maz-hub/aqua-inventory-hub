import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import GiftForm from "../components/GiftForm"; // Import the form

function Gifts() {
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getGifts();
  }, []);

  const getGifts = () => {
    api
      .get("/api/gifts/")
      .then((res) => res.data)
      .then((data) => {
        setGifts(data);
        setLoading(false);
      })
      .catch((err) => {
        alert(err);
        setLoading(false);
      });
  };

  const deleteGift = (id) => {
    api
      .delete(`/api/gifts/delete/${id}/`)
      .then((res) => {
        if (res.status === 204) {
          alert("Gift deleted!");
          getGifts();
        } else {
          alert("Failed to delete gift.");
        }
      })
      .catch((error) => alert(error));
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
      <div className="max-w-7xl mx-auto mb-8">
        <button
          onClick={() => navigate("/")}
          className="mb-4 text-wa-blue hover:text-wa-ocean flex items-center gap-2 cursor-pointer font-medium transition-colors"
        >
          ← Back to Home
        </button>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-wa-navy mb-2">
              Gifts Inventory
            </h1>
            <p className="text-gray-600">{gifts.length} items in stock</p>
          </div>
        </div>

        {/* Use the GiftForm component */}
        <GiftForm onSuccess={getGifts} />
      </div>

      {/* Gifts Grid */}
      <div className="max-w-7xl mx-auto">
        {gifts.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow text-center">
            <p className="text-gray-500 text-lg">
              No gifts in inventory yet. Add your first item above!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {gifts.map((gift) => (
              <div
                key={gift.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  {gift.product_image ? (
                    <img
                      src={gift.product_image}
                      alt={gift.product_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-4xl">📦</span>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-lg text-wa-navy mb-1 truncate">
                    {gift.product_name}
                  </h3>
                  <p className="text-sm text-wa-blue mb-2">
                    {gift.category.name}
                  </p>

                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-600">
                      Stock: <strong>{gift.qty_stock}</strong>
                    </span>
                    <span className="text-gray-600">${gift.unit_price}</span>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 bg-wa-blue text-white py-2 rounded-md hover:bg-wa-ocean text-sm font-medium cursor-pointer transition-all">
                      Edit
                    </button>
                    <button
                      onClick={() => deleteGift(gift.id)}
                      className="flex-1 bg-wa-red text-white py-2 rounded-md hover:bg-red-700 text-sm font-medium cursor-pointer transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Gifts;
