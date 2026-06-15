// OfficeStockAdjustModal is the admin form for manually adjusting stock on a single office item.
//
// Props:
//   item      - the office item whose stock is being adjusted
//   onClose   - called when the user cancels or dismisses without saving
//   onSuccess - called after a successful adjustment so the parent can refetch

import { useState, useEffect } from "react";
import api from "../api";

function OfficeStockAdjustModal({ item, onClose, onSuccess }) {
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

    const newTotal = action === "take"
        ? item.qty_stock - quantity
        : item.qty_stock + quantity;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!reason) {
            alert("Please select a reason for the stock adjustment.");
            return;
        }

        if (action === "take" && quantity > item.qty_stock) {
            alert(`Cannot remove more than current stock (${item.qty_stock} units).`);
            return;
        }

        setLoading(true);

        try {
            await api.patch(`/api/office/update-stock/${item.id}/`, {
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
                        <h2 className="text-xl font-bold text-wa-navy">Adjust Stock</h2>
                        <p className="text-sm text-gray-500 mt-0.5">{item.item_name}</p>
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
                        <span className="font-bold text-wa-navy">{item.qty_stock} units</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Action toggle */}
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
                                Add
                            </button>
                        </div>
                    </div>

                    {/* Quantity */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Quantity *
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                            onFocus={(e) => e.target.select()}
                            className="form_input"
                            required
                        />
                        <div className={`mt-2 px-3 py-2 rounded-lg text-sm font-medium ${
                            newTotal < 0 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"
                        }`}>
                            {item.qty_stock} → {newTotal < 0 ? "Cannot go below 0" : newTotal} units
                        </div>
                    </div>

                    {/* Reason */}
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
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Notes <span className="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="form_input min-h-20"
                            placeholder="e.g. Received new delivery from supplier, 50 units added..."
                        />
                    </div>

                    {/* Buttons */}
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
                            className={`flex-1 rounded-md text-sm font-medium px-8 py-3 cursor-pointer transition-all ${
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

export default OfficeStockAdjustModal;
