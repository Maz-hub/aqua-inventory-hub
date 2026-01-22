/**
 * Add Variant Modal Component
 *
 * Allows adding size/color combinations (variants) to an existing product.
 * Each variant tracks stock independently.
 */

import { useState, useEffect } from "react";
import api from "../api";

function AddVariantModal({ product, onClose, onSuccess }) {
  const [sizeId, setSizeId] = useState("");
  const [gender, setGender] = useState("U");
  const [qtyStock, setQtyStock] = useState("");
  const [minimumStockLevel, setMinimumStockLevel] = useState("5");
  const [sizes, setSizes] = useState([]);
  const [loadingSizes, setLoadingSizes] = useState(true);

  // Fetch sizes  when modal opens
  useEffect(() => {
    fetchSizes();
  }, []);

  const fetchSizes = () => {
    api
      .get("/api/apparel/sizes/")
      .then((res) => {
        setSizes(res.data);
        setLoadingSizes(false);
      })
      .catch((err) => {
        console.error("Failed to load sizes:", err);
        alert("Failed to load sizes");
        setLoadingSizes(false);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!sizeId) {
      alert("Please select a size");
      return;
    }

    if (!qtyStock || qtyStock < 0) {
      alert("Please enter a valid quantity");
      return;
    }

    // Create variant
    api
      .post("/api/apparel/variants/", {
        product_id: product.id,
        size_id: parseInt(sizeId),
        color_id: product.primary_color.id,
        gender: gender,
        qty_stock: parseInt(qtyStock),
        minimum_stock_level: parseInt(minimumStockLevel),
      })
      .then((res) => {
        if (res.status === 201) {
          alert("Variant added successfully!");
          onSuccess();
          onClose();
        }
      })
      .catch((err) => {
        console.error("Error creating variant:", err);
        if (err.response?.data) {
          // Handle unique constraint violation
          if (err.response.data.non_field_errors) {
            alert(
              "This size/color combination already exists for this product!",
            );
          } else {
            alert(
              "Failed to create variant: " + JSON.stringify(err.response.data),
            );
          }
        } else {
          alert("Failed to create variant");
        }
      });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-wa-navy">
                Add Size/Color/Gender Variant
              </h2>
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
            {/* Size Selection */}
            <div>
              <label
                htmlFor="size"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Size *
              </label>
              {loadingSizes ? (
                <p className="text-sm text-gray-500">Loading sizes...</p>
              ) : (
                <select
                  id="size"
                  value={sizeId}
                  onChange={(e) => setSizeId(e.target.value)}
                  className="form_input"
                  required
                >
                  <option value="">Select a size</option>

                  {/* Clothing Sizes */}
                  {sizes.filter((s) => s.size_type === "clothing").length >
                    0 && (
                    <optgroup label="Clothing Sizes">
                      {sizes
                        .filter((s) => s.size_type === "clothing")
                        .map((size) => (
                          <option key={size.id} value={size.id}>
                            {size.size_value}
                          </option>
                        ))}
                    </optgroup>
                  )}

                  {/* Footwear Sizes */}
                  {sizes.filter((s) => s.size_type === "footwear").length >
                    0 && (
                    <optgroup label="Footwear Sizes">
                      {sizes
                        .filter((s) => s.size_type === "footwear")
                        .map((size) => (
                          <option key={size.id} value={size.id}>
                            {size.size_value}
                          </option>
                        ))}
                    </optgroup>
                  )}

                  {/* Accessory Sizes */}
                  {sizes.filter((s) => s.size_type === "accessory").length >
                    0 && (
                    <optgroup label="Accessory Sizes">
                      {sizes
                        .filter((s) => s.size_type === "accessory")
                        .map((size) => (
                          <option key={size.id} value={size.id}>
                            {size.size_value}
                          </option>
                        ))}
                    </optgroup>
                  )}
                </select>
              )}
            </div>

            {/* Color Display (from product) */}
            <div className="bg-gray-50 p-3 rounded border">
              <p className="text-sm text-gray-600 mb-1">Color</p>
              <p className="font-semibold text-wa-navy">
                {product.primary_color
                  ? product.primary_color.color_name
                  : "No color set"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                (Inherited from product)
              </p>
            </div>

            {/* Gender Selection */}
            <div>
              <label
                htmlFor="gender"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Gender Fit *
              </label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="form_input"
                required
              >
                <option value="U">Unisex</option>
                <option value="M">Men</option>
                <option value="W">Women</option>
                <option value="Y">Youth</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Physical fit type (Men's M vs Women's M sizing)
              </p>
            </div>

            {/* Initial Stock Quantity */}
            <div>
              <label
                htmlFor="qtyStock"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Initial Stock Quantity *
              </label>
              <input
                type="number"
                id="qtyStock"
                min="0"
                value={qtyStock}
                onChange={(e) => setQtyStock(e.target.value)}
                className="form_input"
                placeholder="Enter quantity (e.g., 35)"
                required
              />
            </div>

            {/* Minimum Stock Level */}
            <div>
              <label
                htmlFor="minimumStockLevel"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Minimum Stock Level
              </label>
              <input
                type="number"
                id="minimumStockLevel"
                min="0"
                value={minimumStockLevel}
                onChange={(e) => setMinimumStockLevel(e.target.value)}
                className="form_input"
                placeholder="Alert threshold (default: 5)"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={onClose} className="btn_cancel">
                Cancel
              </button>
              <button type="submit" className="btn_confirm">
                Add Variant
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddVariantModal;
