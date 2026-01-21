/**
 * Take Apparel Modal Component
 *
 * Allows taking items from a specific size/color variant.
 * Records transaction with reason tracking.
 */

import { useState, useEffect } from "react";
import api from "../api";

function TakeApparelModal({ product, onClose, onSuccess }) {
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [reasons, setReasons] = useState([]);
  const [loadingReasons, setLoadingReasons] = useState(true);

  // Get selected variant object
  const selectedVariant = product.variants.find(
    (v) => v.id === parseInt(selectedVariantId),
  );

  // Fetch reasons when modal opens
  useEffect(() => {
    api
      .get("/api/reasons/")
      .then((res) => {
        // Filter to show only reasons that apply to Apparel or Both
        const apparelReasons = res.data.filter(
          (r) => r.applies_to === "apparel" || r.applies_to === "both",
        );
        setReasons(apparelReasons);
        setLoadingReasons(false);
      })
      .catch((err) => {
        console.error("Failed to load reasons:", err);
        setLoadingReasons(false);
      });
  }, []);

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

    if (quantity > selectedVariant.qty_stock) {
      alert(
        `Cannot take ${quantity} items. Only ${selectedVariant.qty_stock} available.`,
      );
      return;
    }

    if (!reason) {
      alert("Please select a reason");
      return;
    }

    // Send take request
    api
      .patch(`/api/apparel/variants/update-stock/${selectedVariantId}/`, {
        action: "take",
        quantity: parseInt(quantity),
        reason: parseInt(reason),
        notes: notes,
      })
      .then((res) => {
        if (res.status === 200) {
          alert(
            `Successfully took ${quantity} items. New stock: ${res.data.new_stock}`,
          );
          onSuccess();
          onClose();
        }
      })
      .catch((err) => {
        console.error("Error taking items:", err);
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
                    {variant.qty_stock} available)
                  </option>
                ))}
              </select>
            </div>

            {/* Show selected variant stock */}
            {selectedVariant && (
              <div className="bg-blue-50 p-3 rounded">
                <p className="text-sm text-blue-900">
                  <strong>Available:</strong> {selectedVariant.qty_stock} units
                </p>
              </div>
            )}

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
                max={selectedVariant?.qty_stock || 0}
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

export default TakeApparelModal;
