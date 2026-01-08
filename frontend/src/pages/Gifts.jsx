import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import GiftForm from "../components/GiftForm";
import GiftDetailsModal from "../components/GiftDetailsModal";
import TakeItemsModal from "../components/TakeItemsModal";

function Gifts() {
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGift, setSelectedGift] = useState(null); // Tracks which gift is selected for viewing details
  const [showTakeModal, setShowTakeModal] = useState(false);
  const [selectedGiftForAction, setSelectedGiftForAction] = useState(null);
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
                    <>
                      {/* Remove the temporary console.log once confirmed */}
                      {console.log(
                        "Full image URL from API:",
                        gift.product_image
                      )}

                      <img
                        src={gift.product_image.replace(
                          "http://localhost:8000",
                          ""
                        )}
                        alt={gift.product_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </>
                  ) : (
                    <span className="text-gray-400 text-4xl">📦</span>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-lg text-wa-navy mb-1 truncate">
                    {gift.product_name}
                  </h3>

                  <div className="flex justify-between items-center my-5">
                    <span className="text-gray-600">
                      Stock: <strong>{gift.qty_stock}</strong>
                    </span>
                    <span className="text-sm text-wa-blue mb-2">
                      {gift.category.name}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedGift(gift)}
                      className="w-full bg-wa-blue text-white py-2 rounded-md hover:bg-wa-ocean text-sm font-medium cursor-pointer transition-all"
                    >
                      View Details
                    </button>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedGiftForAction(gift);
                          setShowTakeModal(true);
                        }}
                        className="flex-1 bg-wa-ocean text-white py-2 rounded-md hover:bg-wa-navy text-sm font-medium cursor-pointer transition-all"
                      >
                        Take
                      </button>

                      <button className="flex-1 bg-wa-cyan text-white py-2 rounded-md hover:bg-wa-navy text-sm font-medium cursor-pointer transition-all">
                        Return
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Gift Details Modal - OUTSIDE the map */}
        <GiftDetailsModal
          gift={selectedGift}
          onClose={() => setSelectedGift(null)}
        />
        {/* Take Items Modal */}
        {showTakeModal && selectedGiftForAction && (
          <TakeItemsModal
            gift={selectedGiftForAction}
            onClose={() => {
              setShowTakeModal(false);
              setSelectedGiftForAction(null);
            }}
            onSuccess={getGifts}
          />
        )}
      </div>
    </div>
  );
}

export default Gifts;
