// TransactionHistoryModal shows the full stock movement history for a single gift.
// It is a read-only view — no actions are available inside it.
//
// Props:
//   gift    - the gift object; gift.id is used to fetch transactions and gift.product_name
//             is shown in the modal header
//   onClose - called when the user clicks Close or the X button
//
// State:
//   transactions - list fetched from the API on mount, ordered newest first
//   loading      - true while the fetch is in progress
//
// Data is fetched once when the component mounts (gift.id is in the dependency array
// so it would refetch if a different gift were passed without unmounting, though in
// practice this modal is always unmounted and remounted between uses).
//
// The table shows: date/time, transaction type (red for take, green for return),
// quantity, reason, free-text notes, and the username of who performed it.
// Rows with no reason or notes show a dash.

import { useState, useEffect } from "react";
import api from "../api";

function TransactionHistoryModal({ gift, onClose }) {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/api/gifts/${gift.id}/transactions/`)
            .then((res) => {
                setTransactions(res.data);
                setLoading(false);
            })
            .catch(() => {
                setTransactions([]);
                setLoading(false);
            });
    }, [gift.id]);

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="p-6 flex justify-between items-start border-b">
                    <div>
                        <h2 className="text-2xl font-bold text-wa-navy">Stock History</h2>
                        <p className="text-sm text-gray-500 mt-1">{gift.product_name}</p>
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
                        <p className="text-sm text-gray-400">No transactions recorded for this product.</p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-500 border-b">
                                    <th className="pb-3 font-medium pr-4">Date</th>
                                    <th className="pb-3 font-medium pr-4">Type</th>
                                    <th className="pb-3 font-medium pr-4">Quantity</th>
                                    <th className="pb-3 font-medium pr-4">Reason</th>
                                    <th className="pb-3 font-medium pr-4">Notes</th>
                                    <th className="pb-3 font-medium">Who</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((tx) => (
                                    <tr key={tx.id} className="border-b border-gray-100 last:border-0">
                                        <td className="py-3 pr-4 text-gray-500 whitespace-nowrap">
                                            <span className="block">{new Date(tx.created_at).toLocaleDateString("en-GB")}</span>
                                            <span className="block text-xs text-gray-400">{new Date(tx.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>
                                        </td>
                                        {/* Type is coloured: red for take, green for return */}
                                        <td className="py-3 pr-4">
                                            <span className={`font-medium capitalize ${tx.transaction_type === "take" ? "text-red-500" : "text-green-600"}`}>
                                                {tx.transaction_type}
                                            </span>
                                        </td>
                                        <td className="py-3 pr-4 font-medium text-wa-navy">
                                            {tx.quantity}
                                        </td>
                                        <td className="py-3 pr-4 text-gray-600">
                                            {tx.reason ?? "-"}
                                        </td>
                                        <td className="py-3 pr-4 text-gray-600">
                                            {tx.notes || "-"}
                                        </td>
                                        <td className="py-3 text-gray-500">
                                            {tx.created_by}
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

export default TransactionHistoryModal;
