// StockAdjustmentModal is the admin form for manually adjusting stock on a single gift.
// It is used from both AdminGifts (table row button) and GiftDetailsModal (Adjust Stock button).
//
// Props:
//   gift      - the gift whose stock is being adjusted
//   onClose   - called when the user cancels or dismisses without saving
//   onSuccess - called after a successful adjustment so the parent can refetch
//
// State:
//   action   - "take" (reduce stock) or "return" (add stock); toggles via the button pair
//   quantity - number of units; capped at minimum 1
//   reason   - ID of the selected StockAdjustmentReason; required before submitting
//   notes    - optional free-text context for the transaction record
//   reasons  - list of StockAdjustmentReasons fetched on mount
//   loading  - true while the PATCH request is in flight; disables the Save button
//
// newTotal is derived on every render from action and quantity.
// It is displayed as a preview pill (green when valid, red when the result would go below 0).
//
// Validation in handleSubmit:
//   1. A reason must be selected.
//   2. For "take", quantity must not exceed current stock.
// Both checks show an alert and abort before making any API call.
//
// On success, onSuccess() is called first (triggers parent refetch), then onClose().

import { useState, useEffect } from "react";
import api from "../api";

function StockAdjustmentModal({ gift, onClose, onSuccess }) {
    const [action, setAction] = useState("take");
    const [quantity, setQuantity] = useState(1);
    const [reason, setReason] = useState("");
    const [notes, setNotes] = useState("");
    const [reasons, setReasons] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.get("/api/stock-adjustment-reasons/")
            .then((res) => setReasons(res.data))
            .catch((err) => console.error("Failed to load reasons:", err));
    }, []);

    // Preview of what the stock count will be after the adjustment.
    const newTotal = action === "take"
        ? gift.qty_stock - quantity
        : gift.qty_stock + quantity;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!reason) {
            alert("Please select a reason for the stock adjustment.");
            return;
        }

        if (action === "take" && quantity > gift.qty_stock) {
            alert(
                `Cannot remove more than current stock (${gift.qty_stock} units).`,
            );
            return;
        }

        setLoading(true);

        try {
            await api.patch(`/api/gifts/update-stock/${gift.id}/`, {
                action,
                quantity,
                reason: parseInt(reason),
                notes,
            });
            onSuccess();
            onClose();
        } catch (err) {
            alert(err.response?.data?.error || "Failed to adjust stock.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-5">
                    <div>
                        <h2 className="text-xl font-bold text-wa-navy">
                            Adjust Stock
                        </h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {gift.product_name}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 cursor-pointer text-2xl leading-none"
                    >
                        ×
                    </button>
                </div>

                {/* Current stock info */}
                <div className="bg-gray-50 rounded-xl px-4 py-3 mb-5">
                    <p className="text-sm text-gray-600">
                        Current stock:{" "}
                        <span className="font-bold text-wa-navy">
                            {gift.qty_stock} units
                        </span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Action toggle — Take reduces stock, Return adds stock */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Action *
                        </label>
                        <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                            <button
                                type="button"
                                onClick={() => setAction("take")}
                                className={`flex-1 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                                    action === "take"
                                        ? "bg-wa-blue text-white"
                                        : "bg-white text-gray-500 hover:bg-gray-50"
                                }`}
                            >
                                Take
                            </button>
                            <button
                                type="button"
                                onClick={() => setAction("return")}
                                className={`flex-1 py-2.5 text-sm font-medium transition-colors cursor-pointer border-l border-gray-300 ${
                                    action === "return"
                                        ? "bg-wa-blue text-white"
                                        : "bg-white text-gray-500 hover:bg-gray-50"
                                }`}
                            >
                                Return
                            </button>
                        </div>
                    </div>

                    {/* Quantity — preview pill updates live as the value changes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Quantity *
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) =>
                                setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                            }
                            onFocus={(e) => e.target.select()}
                            className="form_input"
                            required
                        />
                        <div className={`mt-2 px-3 py-2 rounded-lg text-sm font-medium ${
                            newTotal < 0 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"
                        }`}>
                            {gift.qty_stock} → {newTotal < 0 ? "Cannot go below 0" : newTotal} units
                        </div>
                    </div>

                    {/* Reason — required; options come from StockAdjustmentReason in the backend */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Reason *
                        </label>
                        <select
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="form_input"
                            required
                        >
                            <option value="">Select a reason...</option>
                            {reasons.map((r) => (
                                <option key={r.id} value={r.id}>
                                    {r.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Notes
                            <span className="text-gray-400 font-normal">
                                {" "}
                                (optional)
                            </span>
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="form_input min-h-20"
                            placeholder="e.g. Received new delivery from supplier, 50 units added..."
                        />
                    </div>

                    {/* Buttons — Save is disabled while the request is in flight */}
                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 hover:text-gray-100 text-sm cursor-pointer font-medium transition-all px-8 py-3"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex-1 bg-wa-blue hover:bg-wa-ocean text-white rounded-md text-sm font-medium px-8 py-3 cursor-pointer transition-all
                                ${
                                    loading
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        : "bg-wa-blue hover:bg-wa-ocean text-white"
                                }`}
                        >
                            {loading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default StockAdjustmentModal;
