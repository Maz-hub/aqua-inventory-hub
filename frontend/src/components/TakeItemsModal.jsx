/**
 * Take Items Modal Component
 *
 * Allows users to deduct items from inventory with reason tracking.
 * Records who took items, when, how many, and why.
 */

import { useState, useEffect } from "react";
import api from "../api";

function TakeItemsModal({ gift, onClose, onSuccess }) {
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [reasons, setReasons] = useState([]);
  const [loadingReasons, setLoadingReasons] = useState(true);

  // Fetch available reasons from backend when modal opens
  useEffect(() => {
    api
      .get("/api/reasons/")
      .then((res) => {
        // Filter to show only reasons that apply to Gifts or Both
        const giftReasons = res.data.filter(
          (r) => r.applies_to === "gifts" || r.applies_to === "both"
        );
        setReasons(giftReasons);
        setLoadingReasons(false);
      })
      .catch((err) => {
        console.error("Failed to load reasons:", err);
        setLoadingReasons(false);
      });
  }, []);

  const handleSubmit = (e) => {
    // Prevent default form submission (stops page reload)
    e.preventDefault();

    // ============================================
    // VALIDATION - Check data before sending to API
    // ============================================

    // Check if quantity is valid
    if (!quantity || quantity <= 0) {
      alert("Please enter a valid quantity");
      return;
    }

    // Check if enough stock available
    if (quantity > gift.qty_stock) {
      alert(`Cannot take ${quantity} items. Only ${gift.qty_stock} in stock.`);
      return;
    }

    // Check if reason is selected
    if (!reason) {
      alert("Please select a reason");
      return;
    }

    // ============================================
    // API CALL - Send update to Django backend
    // ============================================

    api
      .patch(`/api/gifts/update-stock/${gift.id}/`, {
        action: "take",
        quantity: parseInt(quantity),
        reason: parseInt(reason), // Send reason ID (not string)
        notes: notes,
      })
      .then((res) => {
        // Success handler - runs if API call succeeds
        if (res.status === 200) {
          // Show success message with new stock level from backend
          alert(
            `Successfully took ${quantity} items. New stock: ${res.data.new_stock}`
          );

          onSuccess(); // Call parent function to refresh gift list
          onClose(); // Close the modal
        }
      })
      .catch((err) => {
        // Error handler - runs if API call fails
        alert(err.response?.data?.error || "Failed to update stock");
      });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-wa-navy">Take Items</h2>
              <p className="text-sm text-gray-600 mt-1">{gift.product_name}</p>
              <p className="text-sm text-gray-600">
                Available: {gift.qty_stock} units
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Quantity */}
            <div>
              <label
                htmlFor="quantity"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                How many are you taking? *
              </label>
              <input
                type="number"
                id="quantity"
                min="1"
                max={gift.qty_stock}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="form_input"
                placeholder="Enter quantity"
                required
              />
            </div>

            {/* Reason */}
            <div>
              <label
                htmlFor="reason"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Reason *
              </label>
              {loadingReasons ? (
                <p className="text-sm text-gray-500">Loading reasons...</p>
              ) : (
                <select
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="form_input"
                  required
                >
                  <option value="">Select a reason</option>
                  {reasons.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.reason_name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Notes */}
            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Notes (optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="form_input min-h-20"
                placeholder="Additional details..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="btn_cancel">
                Cancel
              </button>
              <button type="submit" className="btn_confirm">
                Confirm
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TakeItemsModal;