/**
 * Return Apparel Modal Component
 *
 * Allows returning items to a specific size/color variant.
 * Records transaction with optional notes.
 */

import { useState } from "react";
import api from "../api";

function ReturnApparelModal({ product, onClose, onSuccess }) {
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");

  // Get selected variant object
  const selectedVariant = product.variants.find(
    (v) => v.id === parseInt(selectedVariantId)
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!selectedVariantId) {
      alert("Please select a size and color");
      return;
    }

    if (!quantity || quantity <= 0) {
      alert("Please enter a valid quantity");
      return;
    }

    // Send return request
    api
      .patch(`/api/apparel/variants/update-stock/${selectedVariantId}/`, {
        action: "return",
        quantity: parseInt(quantity),
        notes: notes,
      })
      .then((res) => {
        if (res.status === 200) {
          alert(
            `Successfully returned ${quantity} items. New stock: ${res.data.new_stock}`
          );
          onSuccess();
          onClose();
        }
      })
      .catch((err) => {
        console.error("Error returning items:", err);
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
              <p className="text-sm text-gray-600 mt-1">
                {product.product_name}
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
            {/* Variant Selection (Size + Color) */}
            <div>
              <label
                htmlFor="variant"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Select Size & Color *
              </label>
              <select
                id="variant"
                value={selectedVariantId}
                onChange={(e) => setSelectedVariantId(e.target.value)}
                className="form_input"
                required
              >
                <option value="">Select a size/color combination</option>
                {product.variants.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.color.color_name} - {variant.size.size_value} (
                    Current stock: {variant.qty_stock})
                  </option>
                ))}
              </select>
            </div>

            {/* Show selected variant current stock */}
            {selectedVariant && (
              <div className="bg-green-50 p-3 rounded">
                <p className="text-sm text-green-900">
                  <strong>Current Stock:</strong> {selectedVariant.qty_stock}{" "}
                  units
                </p>
              </div>
            )}

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
                className="form_input"
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
                className="form_input min-h-20"
                placeholder="E.g., unused from event, condition notes..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="btn_cancel">
                Cancel
              </button>
              <button type="submit" className="btn_confirm">
                Confirm Return
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ReturnApparelModal;