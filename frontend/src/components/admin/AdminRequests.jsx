/**
 * AdminRequests Component
 *
 * Displays all Item Requests for the preparation team.
 * Allows status updates, item modifications, and notes.
 * Used inside the Admin Panel sidebar section.
 */

import { useState, useEffect } from "react";
import api from "../../api";

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
    ready:          "Ready",
    completed:      "Completed",
    cancelled:      "Cancelled",
};

// Which statuses admin can move a request to
const NEXT_STATUSES = {
    draft:          ["pending", "cancelled"],
    pending:        ["in_preparation", "ready", "completed", "cancelled"],
    in_preparation: ["ready", "completed", "cancelled"],
    ready:          ["completed", "cancelled"],
    completed:      ["cancelled"],
    cancelled:      ["pending"],
};

const STATUS_ACTION_LABELS = {
    in_preparation: "Mark In Preparation",
    ready:          "Mark Ready",
    completed:      "Mark Completed",
    cancelled:      "Cancel Request",
};

function AdminRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("pending");
    const [expandedId, setExpandedId] = useState(null);
    const [adminNotes, setAdminNotes] = useState({});
    const [updating, setUpdating] = useState(null);
    const [addingItemTo, setAddingItemTo] = useState(null);
    // Tracks which request is having an item added
    const [newItemCategory, setNewItemCategory] = useState("");
    const [newItemId, setNewItemId] = useState("");
    const [newItemQty, setNewItemQty] = useState(1);
    const [newItemNotes, setNewItemNotes] = useState("");
    const [categoryItems, setCategoryItems] = useState([]);
    const [loadingItems, setLoadingItems] = useState(false);

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

    const fetchCategoryItems = (category) => {
        setLoadingItems(true);
        setNewItemId("");
        setCategoryItems([]);

        const endpoints = {
            gift: "/api/gifts/",
            apparel: "/api/apparel/variants/",
        };

        const endpoint = endpoints[category];
        if (!endpoint) {
            setLoadingItems(false);
            return;
        }

        api.get(endpoint)
            .then(res => {
                setCategoryItems(res.data);
                setLoadingItems(false);
            })
            .catch(err => {
                console.error("Failed to load items:", err);
                setLoadingItems(false);
            });
    };

    const handleAddItem = (requestId) => {
        if (!newItemCategory || !newItemId || newItemQty < 1) {
            alert("Please select a category, item and quantity.");
            return;
        }

        // Get unit price from selected item
        const selectedItem = categoryItems.find(
            i => i.id === parseInt(newItemId)
        );
        const unitPrice = selectedItem?.unit_price || 0;

        api.post(`/api/requests/${requestId}/items/add/`, {
            item_type: newItemCategory,
            item_id: parseInt(newItemId),
            quantity_requested: newItemQty,
            unit_price: parseFloat(unitPrice),
            notes: newItemNotes,
        })
        .then(() => {
            fetchRequests();
            setAddingItemTo(null);
            setNewItemCategory("");
            setNewItemId("");
            setNewItemQty(1);
            setNewItemNotes("");
            setCategoryItems([]);
        })
        .catch(err => {
            alert(err.response?.data?.error || "Failed to add item");
        });
    };

    const updateStatus = (requestId, newStatus) => {
        setUpdating(requestId);
        api.patch(`/api/requests/${requestId}/status/`, { status: newStatus })
            .then(() => {
                fetchRequests();
                setUpdating(null);
            })
            .catch(err => {
                console.error("Failed to update status:", err);
                alert(err.response?.data?.error || "Failed to update status");
                setUpdating(null);
            });
    };

    const saveAdminNotes = (requestId) => {
        api.patch(`/api/requests/${requestId}/`, {
            admin_notes: adminNotes[requestId] || ""
        })
            .then(() => {
                fetchRequests();
                alert("Notes saved successfully!");
            })
            .catch(err => {
                console.error("Failed to save notes:", err);
                alert("Failed to save notes");
            });
    };

    const filteredRequests = requests.filter(r =>
        filterStatus === "all" ? true : r.status === filterStatus
    );

    if (loading) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Loading requests...</p>
            </div>
        );
    }

    return (
        <div>
            {/* Status Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
                {["all", "pending", "in_preparation", "ready", "completed", "cancelled"].map(s => (
                    <button
                        key={s}
                        onClick={() => setFilterStatus(s)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-colors
                            ${filterStatus === s
                                ? "bg-wa-navy text-white"
                                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                            }`}
                    >
                        {s === "all" ? "All" : STATUS_LABELS[s]}
                        {s !== "all" && (
                            <span className="ml-1.5 text-xs opacity-70">
                                ({requests.filter(r => r.status === s).length})
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Requests List */}
            {filteredRequests.length === 0 ? (
                <div className="bg-white rounded-2xl shadow p-12 text-center">
                    <p className="text-gray-500">No requests found.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredRequests.map(request => (
                        <div key={request.id} className="bg-white rounded-2xl shadow overflow-hidden">

                            {/* Request Header — always visible */}
                            <div
                                className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={() => setExpandedId(
                                    expandedId === request.id ? null : request.id
                                )}
                            >
                                <div className="flex flex-wrap justify-between items-start gap-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="font-bold text-wa-navy">
                                                Request #{request.id}
                                            </span>
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[request.status]}`}>
                                                {STATUS_LABELS[request.status]}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">From:</span> {request.requested_by_username}
                                        </p>
                                        <p className="text-sm text-gray-600 mt-0.5">
                                            <span className="font-medium">Department:</span> {request.department?.name}
                                        </p>
                                        <p className="text-sm text-gray-600 mt-0.5">
                                            <span className="font-medium">Reason:</span> {request.reason?.reason_name}
                                        </p>
                                        <p className="text-sm text-gray-600 mt-0.5">
                                            <span className="font-medium">Date needed:</span> {new Date(request.date_needed).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-wa-navy">
                                            CHF {parseFloat(request.total_cost).toFixed(2)}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {request.items?.length} item{request.items?.length !== 1 ? "s" : ""}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {expandedId === request.id ? "▲ collapse" : "▼ expand"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {expandedId === request.id && (
                                <div className="border-t border-gray-100 p-5">

                                    {/* Line Items */}
                                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Items</h3>
                                    <ul className="space-y-2 mb-6">
                                        {request.items?.map(item => (
                                            <li key={item.id}
                                                className="flex justify-between items-start bg-gray-50 rounded-xl px-4 py-3 gap-4">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-wa-navy">
                                                        {item.item_name}
                                                    </p>
                                                    <p className="text-xs text-gray-400 capitalize mt-0.5">
                                                        {item.item_type}
                                                    </p>
                                                    {item.notes && (
                                                        <p className="text-xs text-gray-400 italic mt-1">
                                                            📝 {item.notes}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    {/* Quantity editor */}
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        defaultValue={item.quantity_requested}
                                                        onFocus={(e) => e.target.select()}
                                                        onBlur={(e) => {
                                                            const newQty = parseInt(e.target.value);
                                                            if (newQty !== item.quantity_requested && newQty > 0) {
                                                                api.patch(
                                                                    `/api/requests/${request.id}/items/${item.id}/`,
                                                                    { quantity_requested: newQty }
                                                                ).then(() => {
                                                                    fetchRequests();
                                                                })
                                                                .catch(err => alert(err.response?.data?.error || "Failed to update quantity"));
                                                            }
                                                        }}
                                                        title="Click to edit quantity — changes save automatically"
                                                        className="w-16 text-center text-sm border border-gray-200 rounded-lg py-1 focus:outline-none focus:border-wa-blue cursor-pointer"
                                                    />
                                                    {/* Delete item */}
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm("Remove this item from the request?")) {
                                                                api.delete(`/api/requests/${request.id}/items/${item.id}/`)
                                                                    .then(() => fetchRequests())
                                                                    .catch(err => alert("Failed to remove item"));
                                                            }
                                                        }}
                                                        className="text-red-400 hover:text-red-600 cursor-pointer transition-colors p-1"
                                                        title="Remove item"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-xs text-wa-blue">
                                                        CHF {parseFloat(item.estimated_cost).toFixed(2)}
                                                    </p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* Add Item Section */}
                                    {addingItemTo === request.id ? (
                                        <div className="bg-blue-50 rounded-xl p-4 mb-4">
                                            <p className="text-sm font-semibold text-wa-navy mb-3">
                                                Add Item to Request
                                            </p>
                                            <div className="space-y-3">
                                                {/* Category selector */}
                                                <select
                                                    value={newItemCategory}
                                                    onChange={(e) => {
                                                        setNewItemCategory(e.target.value);
                                                        fetchCategoryItems(e.target.value);
                                                    }}
                                                    className="form_input"
                                                >
                                                    <option value="">Select category...</option>
                                                    <option value="gift">Gifts</option>
                                                    <option value="apparel">Apparel (Variants)</option>
                                                </select>

                                                {/* Item selector */}
                                                {newItemCategory && (
                                                    <select
                                                        value={newItemId}
                                                        onChange={(e) => setNewItemId(e.target.value)}
                                                        className="form_input"
                                                        disabled={loadingItems}
                                                    >
                                                        <option value="">
                                                            {loadingItems ? "Loading items..." : "Select item..."}
                                                        </option>
                                                        {categoryItems.map(item => (
                                                            <option key={item.id} value={item.id}>
                                                                {newItemCategory === "gift"
                                                                    ? `${item.product_name} (${item.qty_stock} in stock)`
                                                                    : `${item.size?.size_value} — ${item.color?.color_name} (${item.qty_stock} in stock)`
                                                                }
                                                            </option>
                                                        ))}
                                                    </select>
                                                )}

                                                {/* Quantity */}
                                                {newItemId && (
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={newItemQty}
                                                        onChange={(e) => setNewItemQty(parseInt(e.target.value) || 1)}
                                                        onFocus={(e) => e.target.select()}
                                                        placeholder="Quantity"
                                                        className="form_input"
                                                    />
                                                )}

                                                {/* Notes */}
                                                {newItemId && (
                                                    <input
                                                        type="text"
                                                        value={newItemNotes}
                                                        onChange={(e) => setNewItemNotes(e.target.value)}
                                                        placeholder="Notes (optional)"
                                                        className="form_input"
                                                    />
                                                )}

                                                {/* Buttons */}
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setAddingItemTo(null);
                                                            setNewItemCategory("");
                                                            setNewItemId("");
                                                            setNewItemQty(1);
                                                            setNewItemNotes("");
                                                            setCategoryItems([]);
                                                        }}
                                                        className="flex-none px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm cursor-pointer hover:bg-gray-50 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => handleAddItem(request.id)}
                                                        className="flex-1 py-2 bg-wa-blue text-white rounded-lg text-sm font-semibold cursor-pointer hover:bg-wa-ocean transition-colors"
                                                    >
                                                        Add Item
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setAddingItemTo(request.id)}
                                            className="w-full py-2 mb-4 border-2 border-dashed border-gray-300 text-gray-500 rounded-xl text-sm hover:border-wa-blue hover:text-wa-blue cursor-pointer transition-colors"
                                        >
                                            + Add Item to Request
                                        </button>
                                    )}

                                    <p className="text-xs text-gray-400 italic mb-4">
                                        💡 Click quantity to edit — saves automatically when you click away
                                    </p>

                                    {/* Requester Notes */}
                                    {request.notes && (
                                        <div className="bg-yellow-50 rounded-xl px-4 py-3 mb-6">
                                            <p className="text-xs font-semibold text-yellow-700 mb-1">
                                                Note from requester:
                                            </p>
                                            <p className="text-sm text-yellow-800">
                                                {request.notes}
                                            </p>
                                        </div>
                                    )}

                                    {/* Admin Notes */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Internal Notes
                                        </label>
                                        <textarea
                                            value={adminNotes[request.id] ?? request.admin_notes ?? ""}
                                            onChange={e => setAdminNotes({
                                                ...adminNotes,
                                                [request.id]: e.target.value
                                            })}
                                            className="form_input min-h-20"
                                            placeholder="Internal notes (not visible to requester)..."
                                        />
                                        <button
                                            onClick={() => saveAdminNotes(request.id)}
                                            className="mt-2 px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg cursor-pointer transition-colors"
                                        >
                                            Save Notes
                                        </button>
                                    </div>

                                    {/* Status Actions */}
                                    {NEXT_STATUSES[request.status]?.length > 0 && (
                                        <div>
                                            <p className="text-sm font-semibold text-gray-700 mb-3">
                                                Update Status
                                            </p>
                                            <select
                                                defaultValue=""
                                                onChange={(e) => {
                                                    if (e.target.value) {
                                                        updateStatus(request.id, e.target.value);
                                                        e.target.value = "";
                                                    }
                                                }}
                                                disabled={updating === request.id}
                                                className="form_input cursor-pointer"
                                            >
                                                <option value="">
                                                    {updating === request.id ? "Updating..." : "Change status..."}
                                                </option>
                                                {NEXT_STATUSES[request.status].map(newStatus => (
                                                    <option key={newStatus} value={newStatus}>
                                                        {STATUS_ACTION_LABELS[newStatus]}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default AdminRequests;
