// ApparelHistoryModal shows the full stock movement history for all variants of an apparel product.
// It is a read-only view — no actions are available inside it.
//
// Unlike TransactionHistoryModal (which is per-gift), this fetches transactions for the
// entire product by passing product_id as a query parameter. This means all sizes and
// colour variants are shown in one table, with a Variant column identifying which one
// each row refers to.
//
// Props:
//   product - the apparel product object; product.id drives the fetch and product.product_name
//             is shown in the modal header
//   onClose - called when the user clicks Close or the X button
//
// State:
//   transactions - list fetched on mount, covering all variants of the product, newest first
//   loading      - true while the fetch is in progress
//
// genderLabel maps the single-character gender code to a readable string for the Variant column.
//
// The table shows: date/time, variant (colour, size, gender), transaction type
// (red for take, green for add), quantity, stock before/after snapshot,
// reason name, free-text notes, and who performed the transaction.

import { useState, useEffect } from "react";
import api from "../api";

function ApparelHistoryModal({ product, onClose }) {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/api/apparel/transactions/?product_id=${product.id}`)
            .then((res) => {
                setTransactions(res.data);
                setLoading(false);
            })
            .catch(() => {
                setTransactions([]);
                setLoading(false);
            });
    }, [product.id]);

    const genderLabel = (g) =>
        g === "U" ? "Unisex" : g === "M" ? "Men" : g === "W" ? "Women" : "Youth";

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] flex flex-col">
                <div className="p-6 flex justify-between items-start border-b">
                    <div>
                        <h2 className="text-2xl font-bold text-wa-navy">Stock History</h2>
                        <p className="text-sm text-gray-500 mt-1">{product.product_name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl font-bold cursor-pointer"
                    >
                        ×
                    </button>
                </div>

                {/* Scrollable table body */}
                <div className="overflow-y-auto flex-1 p-6">
                    {loading ? (
                        <p className="text-sm text-gray-400">Loading...</p>
                    ) : transactions.length === 0 ? (
                        <p className="text-sm text-gray-400">
                            No transactions recorded for this product.
                        </p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-500 border-b">
                                    <th className="pb-3 font-medium pr-4">Date</th>
                                    <th className="pb-3 font-medium pr-4">Variant</th>
                                    <th className="pb-3 font-medium pr-4">Type</th>
                                    <th className="pb-3 font-medium pr-4">Qty</th>
                                    <th className="pb-3 font-medium pr-4">Before → After</th>
                                    <th className="pb-3 font-medium pr-4">Reason</th>
                                    <th className="pb-3 font-medium pr-4">Notes</th>
                                    <th className="pb-3 font-medium">Who</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((tx) => (
                                    <tr
                                        key={tx.id}
                                        className="border-b border-gray-100 last:border-0"
                                    >
                                        <td className="py-3 pr-4 text-gray-500 whitespace-nowrap">
                                            <span className="block">
                                                {new Date(tx.created_at).toLocaleDateString("en-GB")}
                                            </span>
                                            <span className="block text-xs text-gray-400">
                                                {new Date(tx.created_at).toLocaleTimeString("en-GB", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                        </td>
                                        {/* Variant column identifies the specific size/colour/gender */}
                                        <td className="py-3 pr-4 text-gray-600 whitespace-nowrap">
                                            {tx.variant.color.color_name} – {tx.variant.size.size_value}{" "}
                                            ({genderLabel(tx.variant.gender)})
                                        </td>
                                        {/* Type is coloured: red for take, green for add */}
                                        <td className="py-3 pr-4">
                                            <span
                                                className={`font-medium ${
                                                    tx.transaction_type === "take"
                                                        ? "text-red-500"
                                                        : "text-green-600"
                                                }`}
                                            >
                                                {tx.transaction_type === "take" ? "Take" : "Add"}
                                            </span>
                                        </td>
                                        <td className="py-3 pr-4 font-medium text-wa-navy">
                                            {tx.quantity}
                                        </td>
                                        {/* Stock snapshot captured at transaction time */}
                                        <td className="py-3 pr-4 text-gray-600 whitespace-nowrap">
                                            {tx.stock_before} → {tx.stock_after}
                                        </td>
                                        <td className="py-3 pr-4 text-gray-600">
                                            {tx.reason?.name ?? "-"}
                                        </td>
                                        <td className="py-3 pr-4 text-gray-600">
                                            {tx.notes || "-"}
                                        </td>
                                        <td className="py-3 text-gray-500">
                                            {tx.created_by_username || "-"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="p-6 border-t">
                    <button onClick={onClose} className="btn_cancel">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ApparelHistoryModal;
