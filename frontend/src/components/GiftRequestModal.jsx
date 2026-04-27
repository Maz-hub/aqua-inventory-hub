/**
 * GiftRequestModal Component
 *
 * Allows users to specify a quantity and optional notes
 * before adding a gift item to their Selection for an Item Request.
 */

import { useState } from "react";
import { useSelection } from "../context/SelectionContext";

function GiftRequestModal({ gift, onClose }) {
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState("");
    const { addItem } = useSelection();

    const handleAdd = () => {
        if (quantity < 1) {
            alert("Please enter a valid quantity.");
            return;
        }
        if (quantity > gift.qty_stock) {
            alert(`Only ${gift.qty_stock} available.`);
            return;
        }

        addItem({
            item_type: "gift",
            item_id: gift.id,
            name: gift.product_name,
            unit_price: parseFloat(gift.unit_price),
            quantity: parseInt(quantity),
            max_quantity: gift.qty_stock,
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
                                {gift.product_name}
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
                        {/* Stock info */}
                        <div className="bg-blue-50 rounded-xl px-4 py-3">
                            <p className="text-sm text-blue-800">
                                <span className="font-semibold">
                                    Available stock:
                                </span>{" "}
                                {gift.qty_stock} units
                            </p>
                        </div>

                        {/* Quantity */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Quantity *
                            </label>
                            <input
                                type="number"
                                min="1"
                                max={gift.qty_stock}
                                value={quantity}
                                onChange={(e) =>
                                    setQuantity(
                                        Math.min(
                                            Math.max(
                                                1,
                                                parseInt(e.target.value) || 1,
                                            ),
                                            gift.qty_stock,
                                        ),
                                    )
                                }
                                onFocus={(e) => e.target.select()}
                                className="form_input"
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
                                placeholder="e.g. No plastic wrap, urgent..."
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
                                disabled={!quantity}
                                className={`flex-1 py-2 rounded-lg font-semibold transition-colors cursor-pointer
            ${
                !quantity
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

export default GiftRequestModal;
