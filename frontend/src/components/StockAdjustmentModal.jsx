/**
 * StockAdjustmentModal Component
 *
 * Allows admin to manually adjust stock quantity for a gift.
 * Creates a transaction record with reason for full audit trail.
 * Used exclusively in the Admin Panel.
 */

import { useState, useEffect } from "react";
import api from "../api";

function StockAdjustmentModal({ gift, onClose, onSuccess }) {
    const [adjustment, setAdjustment] = useState(0);
    const [reason, setReason] = useState("");
    const [notes, setNotes] = useState("");
    const [reasons, setReasons] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.get("/api/stock-adjustment-reasons/")
            .then((res) => setReasons(res.data))
            .catch((err) => console.error("Failed to load reasons:", err));
    }, []);

    const newTotal = gift.qty_stock + adjustment;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!reason) {
            alert("Please select a reason for the stock adjustment.");
            return;
        }

        if (adjustment === 0) {
            alert("Please enter a quantity to add or remove.");
            return;
        }

        if (gift.qty_stock + adjustment < 0) {
            alert(
                `Cannot remove more than current stock (${gift.qty_stock} units).`,
            );
            return;
        }

        setLoading(true);

        const action = adjustment > 0 ? "return" : "take";
        const quantity = Math.abs(adjustment);

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
                    {/* Adjustment quantity */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Quantity to Add or Remove *
                        </label>
                        <input
                            type="number"
                            value={adjustment}
                            onChange={(e) =>
                                setAdjustment(parseInt(e.target.value) || 0)
                            }
                            onFocus={(e) => e.target.select()}
                            className="form_input"
                            placeholder="e.g. +50 to add, -5 to remove"
                            required
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            Use positive number to add stock, negative to remove
                        </p>
                        {adjustment !== 0 && (
                            <div
                                className={`mt-2 px-3 py-2 rounded-lg text-sm font-medium
                                ${newTotal < 0 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}
                            >
                                {gift.qty_stock} →{" "}
                                {newTotal < 0 ? "Cannot go below 0" : newTotal}{" "}
                                units
                            </div>
                        )}
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
