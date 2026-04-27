/**
 * ApparelRequestModal Component
 *
 * Allows users to select a specific apparel variant
 * (size + color + gender) and add it to their Selection
 * for an Item Request.
 * Notes field included for special instructions to preparation team.
 */

import { useState } from "react";
import { useSelection } from "../context/SelectionContext";

function ApparelRequestModal({ product, onClose }) {
    const [selectedVariantId, setSelectedVariantId] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState("");
    const { addItem } = useSelection();

    // Get selected variant object from product variants
    const selectedVariant = product.variants.find(
        (v) => v.id === parseInt(selectedVariantId),
    );

    const handleAdd = () => {
        if (!selectedVariantId) {
            alert("Please select a size and colour.");
            return;
        }
        if (quantity < 1) {
            alert("Please enter a valid quantity.");
            return;
        }
        if (quantity > selectedVariant.qty_stock) {
            alert(`Only ${selectedVariant.qty_stock} available.`);
            return;
        }

        // Add apparel variant to Selection
        addItem({
            item_type: "apparel",
            item_id: selectedVariant.id,
            name: `${product.product_name} — ${selectedVariant.size.size_value} ${selectedVariant.color.color_name}`,
            unit_price: parseFloat(product.unit_price),
            quantity: parseInt(quantity),
            max_quantity: selectedVariant.qty_stock,
            notes: notes,
        });

        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-5">
                        <div>
                            <h2 className="text-xl font-bold text-wa-navy">
                                Add to Request
                            </h2>
                            <p className="text-sm text-gray-500 mt-0.5">
                                {product.product_name}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors text-2xl leading-none"
                        >
                            ×
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Variant Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Size & Colour *
                            </label>
                            <select
                                value={selectedVariantId}
                                onChange={(e) => {
                                    setSelectedVariantId(e.target.value);
                                    setQuantity(1);
                                }}
                                className="form_input"
                            >
                                <option value="">Select size and colour</option>
                                {product.variants
                                    .filter((v) => v.qty_stock > 0)
                                    .map((variant) => (
                                        <option
                                            key={variant.id}
                                            value={variant.id}
                                        >
                                            {variant.size.size_value} —{" "}
                                            {variant.color.color_name} —{" "}
                                            {variant.gender === "U"
                                                ? "Unisex"
                                                : variant.gender === "M"
                                                  ? "Men"
                                                  : variant.gender === "W"
                                                    ? "Women"
                                                    : "Youth"}{" "}
                                            ({variant.qty_stock} available)
                                        </option>
                                    ))}
                            </select>
                        </div>

                        {/* Stock info */}
                        {selectedVariant && (
                            <div className="bg-blue-50 rounded-xl px-4 py-3">
                                <p className="text-sm text-blue-800">
                                    <span className="font-semibold">
                                        Available stock:
                                    </span>{" "}
                                    {selectedVariant.qty_stock} units
                                </p>
                            </div>
                        )}

                        {/* Quantity */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Quantity *
                            </label>
                            <input
                                type="number"
                                min="1"
                                max={selectedVariant?.qty_stock || 1}
                                value={quantity}
                                onChange={(e) =>
                                    setQuantity(
                                        Math.min(
                                            Math.max(
                                                1,
                                                parseInt(e.target.value) || 1,
                                            ),
                                            selectedVariant?.qty_stock || 1,
                                        ),
                                    )
                                }
                                onFocus={(e) => e.target.select()}
                                className="form_input"
                                disabled={!selectedVariantId}
                            />
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Notes for preparation team
                                <span className="text-gray-400 font-normal">
                                    {" "}
                                    (optional)
                                </span>
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="form_input min-h-20"
                                placeholder="e.g. Navy blue version preferred, fitted cut..."
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 pt-1">
                            <button
                                onClick={onClose}
                                className="flex-none bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 hover:text-gray-100 text-sm cursor-pointer font-medium transition-all px-6 py-2"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAdd}
                                disabled={!selectedVariantId}
                                className={`flex-1 py-2 rounded-lg font-semibold transition-colors cursor-pointer
                                    ${
                                        !selectedVariantId
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            : "bg-wa-blue hover:bg-wa-ocean text-white"
                                    }`}
                            >
                                Add to Selection
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ApparelRequestModal;
