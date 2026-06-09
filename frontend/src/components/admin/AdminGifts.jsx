// AdminGifts renders the gifts inventory table inside the Admin Panel.
// No props — it fetches its own data on mount.
//
// State overview:
//   gifts            - full list fetched from the API
//   loading          - shows a loading message until the first fetch completes
//   searchQuery      - live text filter applied to product names
//   selectedCategory - category ID filter; empty string means "all"
//   categories       - list for the category dropdown
//   selectedGift     - when set to a gift object, opens GiftDetailsModal
//   historyGift      - when set to a gift object, opens TransactionHistoryModal
//   adjustGift       - when set to a gift object, opens StockAdjustmentModal
//   showAddForm      - controls visibility of the GiftForm modal
//   showLowStockOnly - when true, only shows gifts at or below minimum_stock_level
//
// filteredGifts is derived from gifts on every render by applying all three
// active filters. No separate state is needed for the filtered list.
//
// filtersActive is true when any filter is set; used to conditionally show
// the Clear button so it only appears when there is something to clear.
//
// Modal pattern:
//   GiftDetailsModal is always mounted — it handles a null gift prop internally.
//   TransactionHistoryModal, StockAdjustmentModal, and GiftForm are only mounted
//   when their trigger state is truthy, to avoid unnecessary API calls.
//
// After adding a new gift, GiftForm's onSuccess clears the search and category
// filters and refetches, so the new item is visible in an unfiltered list.

import { useState, useEffect } from "react";
import api from "../../api";
import GiftDetailsModal from "../GiftDetailsModal";
import TransactionHistoryModal from "../TransactionHistoryModal";
import StockAdjustmentModal from "../StockAdjustmentModal";
import GiftForm from "../GiftForm";

function AdminGifts() {
    const [gifts, setGifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [categories, setCategories] = useState([]);
    const [selectedGift, setSelectedGift] = useState(null);
    const [historyGift, setHistoryGift] = useState(null);
    const [adjustGift, setAdjustGift] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showLowStockOnly, setShowLowStockOnly] = useState(false);

    useEffect(() => {
        fetchGifts();
        fetchCategories();
    }, []);

    const fetchGifts = () => {
        api.get("/api/gifts/")
            .then(res => {
                setGifts(res.data);
                setLoading(false);
            })
            .catch(err => console.error("Failed to load gifts:", err));
    };

    const fetchCategories = () => {
        api.get("/api/gifts/categories/")
            .then(res => setCategories(res.data))
            .catch(err => console.error("Failed to load categories:", err));
    };

    // Applies all active filters to produce the list shown in the table/cards.
    const filteredGifts = gifts.filter(gift => {
        const matchesSearch = gift.product_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "" ||
            gift.category.id === parseInt(selectedCategory);
        const matchesLowStock = !showLowStockOnly ||
            gift.qty_stock <= gift.minimum_stock_level;
        return matchesSearch && matchesCategory && matchesLowStock;
    });

    // True when any filter is active — used to show the Clear button.
    const filtersActive = searchQuery !== "" || selectedCategory !== "" || showLowStockOnly;

    const clearFilters = () => {
        setSearchQuery("");
        setSelectedCategory("");
        setShowLowStockOnly(false);
    };

    const handleDelete = async (gift) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${gift.product_name}"? This cannot be undone.`
        );
        if (!confirmed) return;
        try {
            await api.delete(`/api/gifts/delete/${gift.id}/`);
            fetchGifts();
        } catch (err) {
            alert(err.response?.data?.error || "Failed to delete gift.");
        }
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Loading gifts...</p>
            </div>
        );
    }

    return (
        <div>
            {/* Toolbar */}
            <div className="flex flex-col gap-3 mb-6">
                {/* Row 1: Search + Category */}
                <div className="flex flex-col xl:flex-row gap-3">
                    <input
                        type="text"
                        placeholder="Search gifts..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="form_input w-full xl:flex-1 xl:min-w-0"
                    />
                    <select
                        value={selectedCategory}
                        onChange={e => setSelectedCategory(e.target.value)}
                        className="form_input w-full xl:flex-1 xl:min-w-0"
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                {/* Row 2: Add button (left) | Low Stock + Clear (right) */}
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-2">
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="bg-wa-blue text-white px-4 py-2 rounded-lg text-sm hover:bg-wa-ocean transition-colors cursor-pointer w-full xl:w-auto"
                    >
                        + Add New Gift
                    </button>
                    <div className="flex flex-col xl:flex-row gap-2">
                        <button
                            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors border w-full xl:w-auto ${
                                showLowStockOnly
                                    ? "bg-red-500 border-red-500 text-white hover:bg-red-600 hover:border-red-600"
                                    : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                            {showLowStockOnly ? "✓ Low Stock Only" : "Show Low Stock"}
                        </button>
                        {filtersActive && (
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 transition-colors w-full xl:w-auto"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Table — desktop */}
            <div className="hidden xl:block bg-white rounded-2xl shadow overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                Image
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                Product
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                Category
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                Stock
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                Price
                            </th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredGifts.map(gift => (
                            <tr
                                key={gift.id}
                                className="hover:bg-gray-50 transition-colors"
                            >
                                <td className="px-4 py-3">
                                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                        {gift.product_image ? (
                                            <img
                                                src={gift.product_image.replace("http://localhost:8000", "")}
                                                alt={gift.product_name}
                                                className="w-full h-full object-contain"
                                            />
                                        ) : (
                                            <span className="text-gray-400 text-xl">📦</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <p className="font-medium text-wa-navy">
                                        {gift.product_name}
                                    </p>
                                    {/* Low stock badge — shown when qty is at or below its threshold */}
                                    {gift.qty_stock <= gift.minimum_stock_level && (
                                        <span className="text-xs text-red-500 font-medium">
                                            Low Stock
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                    {gift.category.name}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`font-semibold ${gift.qty_stock <= gift.minimum_stock_level ? "text-red-500" : "text-wa-navy"}`}>
                                        {gift.qty_stock}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                                    $ {parseFloat(gift.unit_price).toFixed(2)}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-2 justify-between">
                                        <button
                                            onClick={() => setSelectedGift(gift)}
                                            className="text-wa-blue hover:text-wa-ocean border border-wa-blue hover:border-wa-ocean text-xs font-medium cursor-pointer transition-colors px-2 py-0.5 rounded"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => setAdjustGift(gift)}
                                            className="text-wa-cyan hover:text-wa-ocean border border-wa-cyan hover:border-wa-ocean text-xs font-medium cursor-pointer transition-colors px-2 py-0.5 rounded"
                                        >
                                            Adjust Stock
                                        </button>
                                        <button
                                            onClick={() => setHistoryGift(gift)}
                                            className="text-gray-400 hover:text-wa-navy border border-gray-300 hover:border-wa-navy text-xs font-medium cursor-pointer transition-colors px-2 py-0.5 rounded"
                                        >
                                            History
                                        </button>
                                        <button
                                            onClick={() => handleDelete(gift)}
                                            className="text-red-400 hover:text-red-600 border border-red-300 hover:border-red-500 text-xs font-medium cursor-pointer transition-colors px-2 py-0.5 rounded"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Cards — mobile */}
            <div className="xl:hidden space-y-3">
                {filteredGifts.map(gift => (
                    <div
                        key={gift.id}
                        className="bg-white rounded-2xl shadow p-4"
                    >
                        <div className="flex items-start gap-3">
                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
                                {gift.product_image ? (
                                    <img
                                        src={gift.product_image.replace("http://localhost:8000", "")}
                                        alt={gift.product_name}
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <span className="text-gray-400 text-2xl">📦</span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-wa-navy truncate">
                                    {gift.product_name}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {gift.category.name}
                                </p>
                                <p className="text-sm text-gray-600 mt-2">
                                    Stock: {gift.qty_stock}
                                </p>
                                <p className="text-sm text-gray-500">
                                    $ {parseFloat(gift.unit_price).toFixed(2)}
                                </p>
                                {gift.qty_stock <= gift.minimum_stock_level && (
                                    <span className="text-xs text-red-500 font-medium">
                                        Low Stock
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-col gap-2 shrink-0">
                                <button
                                    onClick={() => setSelectedGift(gift)}
                                    className="text-wa-blue hover:text-wa-ocean border border-wa-blue hover:border-wa-ocean text-xs font-medium cursor-pointer transition-colors px-2 py-0.5 rounded"
                                >
                                    View
                                </button>
                                <button
                                    onClick={() => setAdjustGift(gift)}
                                    className="text-wa-cyan hover:text-wa-ocean border border-wa-cyan hover:border-wa-ocean text-xs font-medium cursor-pointer transition-colors px-2 py-0.5 rounded"
                                >
                                    Adjust Stock
                                </button>
                                <button
                                    onClick={() => setHistoryGift(gift)}
                                    className="text-gray-400 hover:text-wa-navy border border-gray-300 hover:border-wa-navy text-xs font-medium cursor-pointer transition-colors px-2 py-0.5 rounded"
                                >
                                    History
                                </button>
                                <button
                                    onClick={() => handleDelete(gift)}
                                    className="text-red-400 hover:text-red-600 border border-red-300 hover:border-red-500 text-xs font-medium cursor-pointer transition-colors px-2 py-0.5 rounded"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* GiftDetailsModal is always mounted; it handles a null gift prop internally */}
            <GiftDetailsModal
                gift={selectedGift}
                onClose={() => setSelectedGift(null)}
                onSuccess={fetchGifts}
                isAdmin={true}
            />

            {historyGift && (
                <TransactionHistoryModal
                    gift={historyGift}
                    onClose={() => setHistoryGift(null)}
                />
            )}

            {showAddForm && (
                <GiftForm
                    onClose={() => setShowAddForm(false)}
                    onSuccess={() => {
                        setShowAddForm(false);
                        setSearchQuery("");
                        setSelectedCategory("");
                        fetchGifts();
                    }}
                />
            )}

            {adjustGift && (
                <StockAdjustmentModal
                    gift={adjustGift}
                    onClose={() => setAdjustGift(null)}
                    onSuccess={() => {
                        setAdjustGift(null);
                        fetchGifts();
                    }}
                />
            )}
        </div>
    );
}

export default AdminGifts;
