// MyRequests shows all item requests submitted by the logged-in user.
// No props — the backend endpoint filters to the current user automatically.
//
// State overview:
//   requests      - list of the user's own requests, ordered newest first by the backend
//   loading       - shows a loading message until the first fetch completes
//   selectionOpen - controls SelectionDrawer visibility (accessible via the Header)
//
// STATUS_STYLES and STATUS_LABELS map each status code to a Tailwind colour class
// and a human-readable label for the badge shown on each request card.
//
// cancelRequest:
//   Prompts for confirmation, then calls PATCH /cancel/ which also restores stock.
//   Only available for requests in "pending" or "draft" status.
//   Pending requests have stock deducted; cancelling them restores it.
//   Draft requests never deducted stock, so cancellation is simply a status change.
//
// Per line item, the quantity display uses quantity_confirmed when set, otherwise
// quantity_requested. If the admin confirmed a different quantity, the original
// requested amount is shown in amber as "(requested: X)" so the user knows it changed.
//
// The empty state shows a Browse Inventory button when the user has no requests yet.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Header from "../components/Header";
import SelectionDrawer from "../components/SelectionDrawer";

// Status badge colours
const STATUS_STYLES = {
    draft:          "bg-gray-100 text-gray-600",
    pending:        "bg-yellow-100 text-yellow-700",
    in_preparation: "bg-blue-100 text-blue-700",
    ready:          "bg-green-100 text-green-700",
    completed:      "bg-purple-100 text-purple-700",
    cancelled:      "bg-red-100 text-red-700",
};

const STATUS_LABELS = {
    draft:          "Draft",
    pending:        "Pending",
    in_preparation: "In Preparation",
    ready:          "Ready for Collection",
    completed:      "Completed",
    cancelled:      "Cancelled",
};

function MyRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectionOpen, setSelectionOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = () => {
        api.get("/api/requests/")
            .then(res => {
                setRequests(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load requests:", err);
                setLoading(false);
            });
    };

    // Cancels a pending or draft request after confirmation.
    // For pending requests, stock is restored on the backend before status changes.
    const cancelRequest = (requestId) => {
        if (window.confirm("Are you sure you want to cancel this request?")) {
            api.patch(`/api/requests/${requestId}/cancel/`)
                .then(() => fetchRequests())
                .catch(err => alert(err.response?.data?.error || "Failed to cancel request"));
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Header onSelectionOpen={() => setSelectionOpen(true)} />

            <div className="flex-1 p-4 md:p-8">
                <div className="max-w-4xl mx-auto">

                    {/* Back button */}
                    <button
                        onClick={() => navigate("/")}
                        className="mb-6 text-wa-blue hover:text-wa-ocean flex items-center gap-2 cursor-pointer font-medium transition-colors"
                    >
                        ← Back to Home
                    </button>

                    <h1 className="text-3xl font-bold text-wa-navy mb-8">
                        My Requests
                    </h1>

                    {loading ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">Loading requests...</p>
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow p-12 text-center">
                            <div className="text-5xl mb-4">📋</div>
                            <p className="text-gray-500 text-lg mb-4">
                                You have not submitted any requests yet.
                            </p>
                            <button
                                onClick={() => navigate("/")}
                                className="bg-wa-blue text-white px-6 py-3 rounded-xl font-semibold hover:bg-wa-ocean transition-colors cursor-pointer"
                            >
                                Browse Inventory
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {requests.map(request => (
                                <div key={request.id} className="bg-white rounded-2xl shadow p-4 md:p-6">

                                    {/* Status badge */}
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-sm font-semibold text-gray-400">
                                            Request #{request.id}
                                        </p>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[request.status]}`}>
                                            {STATUS_LABELS[request.status]}
                                        </span>
                                    </div>

                                    {/* Info grid — stacks on mobile */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mb-4">
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Department:</span> {request.department?.name}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Reason:</span> {request.reason?.reason_name}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Date needed:</span> {new Date(request.date_needed).toLocaleDateString()}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Submitted:</span> {new Date(request.created_at).toLocaleDateString()} {new Date(request.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>

                                    {/* Line Items */}
                                    {request.items && request.items.length > 0 && (
                                        <div className="border-t border-gray-100 pt-4 mb-4">
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                                Items
                                            </p>
                                            <ul className="space-y-2">
                                                {request.items.map(item => (
                                                    <li key={item.id} className="flex justify-between items-start text-sm gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-wa-navy font-medium truncate">
                                                                {item.item_name || `${item.item_type} #${item.item_id}`}
                                                            </p>
                                                            {item.notes && (
                                                                <p className="text-xs text-gray-400 italic mt-0.5">
                                                                    📝 {item.notes}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="text-right shrink-0">
                                                            <p className="text-gray-400 text-xs">
                                                                Unit price: $ {parseFloat(item.unit_price).toFixed(2)}
                                                            </p>
                                                            {/* Shows confirmed qty if set; highlights in amber when it differs from requested */}
                                                            <p className="text-gray-500 text-xs">
                                                                x{item.quantity_confirmed ?? item.quantity_requested}
                                                                {item.quantity_confirmed !== null &&
                                                                 item.quantity_confirmed !== undefined &&
                                                                 item.quantity_confirmed !== item.quantity_requested && (
                                                                    <span className="text-amber-600 ml-1">(requested: {item.quantity_requested})</span>
                                                                )}
                                                            </p>
                                                            <p className="text-wa-blue font-medium text-sm whitespace-nowrap">
                                                                $ {parseFloat(item.unit_price * item.quantity_requested).toFixed(2)}
                                                            </p>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Total + Cancel button row.
                                        Cancel is only available on pending and draft requests. */}
                                    <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                        <p className="text-lg font-bold text-wa-navy whitespace-nowrap">
                                            $ {parseFloat(request.total_cost).toFixed(2)}
                                        </p>
                                        {(request.status === 'pending' || request.status === 'draft') && (
                                            <button
                                                onClick={() => cancelRequest(request.id)}
                                                className="text-sm text-red-500 hover:text-red-700 cursor-pointer transition-colors font-medium"
                                            >
                                                Cancel Request
                                            </button>
                                        )}
                                    </div>

                                    {/* Notes from requester */}
                                    {request.notes && (
                                        <div className="mt-3">
                                            <p className="text-xs text-gray-400 italic">📝 {request.notes}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <SelectionDrawer
                isOpen={selectionOpen}
                onClose={() => setSelectionOpen(false)}
            />
        </div>
    );
}

export default MyRequests;
