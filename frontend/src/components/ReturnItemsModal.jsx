/**
 * Return Items Modal Component
 *
 * Allows users to add items back to inventory when returned from events.
 * Records who returned items, when, how many, and any notes.
 */

import { useState } from "react";
import api from "../api";

function ReturnItemsModal({ gift, onClose, onSuccess }) {
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!quantity || quantity <= 0) {
      alert("Please enter a valid quantity");
      return;
    }

    // Call API to update stock
    api
      .patch(`/api/gifts/update-stock/${gift.id}/`, {
        action: "return",
        quantity: parseInt(quantity),
      })
      .then((res) => {
        if (res.status === 200) {
          alert(
            `Successfully returned ${quantity} items. New stock: ${res.data.new_stock}`
          );
          onSuccess(); // Refresh the gift list
          onClose(); // Close modal
        }
      })
      .catch((err) => {
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
              <h2 className="text-2xl font-bold text-wa-navy">Return Items</h2>
              <p className="text-sm text-gray-600 mt-1">{gift.product_name}</p>
              <p className="text-sm text-gray-600">
                Current Stock: {gift.qty_stock} units
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
                How many are you returning? *
              </label>
              <input
                type="number"
                id="quantity"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wa-cyan focus:border-wa-cyan transition-colors"
                placeholder="Enter quantity"
                required
              />
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
                className="w-full px-4 py-2 border border-gray-300 rounded-md min-h-20 resize-y focus:outline-none focus:ring-2 focus:ring-wa-cyan focus:border-wa-cyan transition-colors"
                placeholder="Where were these items from? Any condition notes?"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-md hover:bg-gray-300 cursor-pointer transition-all font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-wa-cyan text-white py-2 rounded-md hover:bg-wa-ocean cursor-pointer transition-all font-medium"
              >
                Confirm
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ReturnItemsModal;
