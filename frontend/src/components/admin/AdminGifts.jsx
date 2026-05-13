/**
 * AdminGifts Component
 *
 * Shopify-style table view of all gifts for admin users.
 * Supports checkbox selection, inline stock adjustment,
 * and product editing. Used inside the Admin Panel.
 */

import { useState, useEffect } from "react";
import api from "../../api";
import GiftDetailsModal from "../GiftDetailsModal";
import TransactionHistoryModal from "../TransactionHistoryModal";
import StockAdjustmentModal from "../StockAdjustmentModal";
import GiftForm from "../GiftForm";

function AdminGifts() {
    const [gifts, setGifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [categories, setCategories] = useState([]);
    const [selectedGift, setSelectedGift] = useState(null);
    const [historyGift, setHistoryGift] = useState(null);
    const [adjustGift, setAdjustGift] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showLowStockOnly, setShowLowStockOnly] = useState(false);
    const [adjustReasons, setAdjustReasons] = useState([]);

    useEffect(() => {
        fetchGifts();
        fetchCategories();
        fetchAdjustReasons();
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

    const fetchAdjustReasons = () => {
        api.get("/api/stock-adjustment-reasons/")
            .then(res => setAdjustReasons(res.data))
            .catch(err => console.error("Failed to load adjustment reasons:", err));
    };

    const toggleSelect = (id) => {
        setSelected(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selected.length === filteredGifts.length) {
            setSelected([]);
        } else {
            setSelected(filteredGifts.map(g => g.id));
        }
    };

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

    const filtersActive = searchQuery !== "" || selectedCategory !== "" || showLowStockOnly;

    const clearFilters = () => {
        setSearchQuery("");
        setSelectedCategory("");
        setShowLowStockOnly(false);
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
                {/* Row 1: Search + Category (stacked on mobile, side-by-side on desktop) */}
                <div className="flex flex-col md:flex-row gap-3">
                    <input
                        type="text"
                        placeholder="Search gifts..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="form_input w-full md:flex-1 md:min-w-0"
                    />
                    <select
                        value={selectedCategory}
                        onChange={e => setSelectedCategory(e.target.value)}
                        className="form_input w-full md:flex-1 md:min-w-0"
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                {/* Row 2: Add New Gift (left) | Low Stock + Clear (right) — stacked on mobile */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="bg-wa-blue text-white px-4 py-2 rounded-lg text-sm hover:bg-wa-ocean transition-colors cursor-pointer w-full md:w-auto"
                    >
                        + Add New Gift
                    </button>
                    <div className="flex flex-col md:flex-row gap-2">
                        <button
                            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors border w-full md:w-auto ${
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
                                className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 transition-colors w-full md:w-auto"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Selected actions bar */}
            {selected.length > 0 && (
                <div className="bg-wa-blue/10 border border-wa-blue/20 rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
                    <p className="text-sm font-medium text-wa-navy">
                        {selected.length} item{selected.length !== 1 ? "s" : ""} selected
                    </p>
                    {/* Export to Excel button will go here */}
                </div>
            )}

            {/* Table — desktop */}
            <div className="hidden md:block bg-white rounded-2xl shadow overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-4 py-3 text-left">
                                <input
                                    type="checkbox"
                                    checked={selected.length === filteredGifts.length && filteredGifts.length > 0}
                                    onChange={toggleSelectAll}
                                    className="cursor-pointer"
                                />
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Image</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Stock</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Price</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredGifts.map(gift => (
                            <tr
                                key={gift.id}
                                className={`hover:bg-gray-50 transition-colors ${selected.includes(gift.id) ? "bg-blue-50" : ""}`}
                            >
                                <td className="px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={selected.includes(gift.id)}
                                        onChange={() => toggleSelect(gift.id)}
                                        className="cursor-pointer"
                                    />
                                </td>
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
                                    <p className="font-medium text-wa-navy">{gift.product_name}</p>
                                    {gift.qty_stock <= gift.minimum_stock_level && (
                                        <span className="text-xs text-red-500 font-medium">Low Stock</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-gray-600">{gift.category.name}</td>
                                <td className="px-4 py-3">
                                    <span className={`font-semibold ${gift.qty_stock <= gift.minimum_stock_level ? "text-red-500" : "text-wa-navy"}`}>
                                        {gift.qty_stock}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                                    CHF {parseFloat(gift.unit_price).toFixed(2)}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setSelectedGift(gift)}
                                            className="text-wa-blue hover:text-wa-ocean text-xs font-medium cursor-pointer transition-colors"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => setAdjustGift(gift)}
                                            className="text-wa-cyan hover:text-wa-ocean text-xs font-medium cursor-pointer transition-colors"
                                        >
                                            Adjust Stock
                                        </button>
                                        <button
                                            onClick={() => setHistoryGift(gift)}
                                            className="text-gray-400 hover:text-wa-navy text-xs font-medium cursor-pointer transition-colors"
                                        >
                                            History
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Cards — mobile */}
            <div className="md:hidden space-y-3">
                {filteredGifts.map(gift => (
                    <div
                        key={gift.id}
                        className={`bg-white rounded-2xl shadow p-4 ${selected.includes(gift.id) ? "ring-2 ring-wa-blue" : ""}`}
                    >
                        <div className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                checked={selected.includes(gift.id)}
                                onChange={() => toggleSelect(gift.id)}
                                className="cursor-pointer mt-1"
                            />
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
                                <p className="font-semibold text-wa-navy truncate">{gift.product_name}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{gift.category.name}</p>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className={`text-sm font-semibold ${gift.qty_stock <= gift.minimum_stock_level ? "text-red-500" : "text-wa-navy"}`}>
                                        Stock: {gift.qty_stock}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        CHF {parseFloat(gift.unit_price).toFixed(2)}
                                    </span>
                                </div>
                                {gift.qty_stock <= gift.minimum_stock_level && (
                                    <span className="text-xs text-red-500 font-medium">Low Stock</span>
                                )}
                            </div>
                            <div className="flex flex-col gap-2 shrink-0">
                                <button
                                    onClick={() => setSelectedGift(gift)}
                                    className="text-wa-blue hover:text-wa-ocean text-xs font-medium cursor-pointer transition-colors"
                                >
                                    View
                                </button>
                                <button
                                    onClick={() => setAdjustGift(gift)}
                                    className="text-wa-cyan hover:text-wa-ocean text-xs font-medium cursor-pointer transition-colors"
                                >
                                    Adjust Stock
                                </button>
                                <button
                                    onClick={() => setHistoryGift(gift)}
                                    className="text-gray-400 hover:text-wa-navy text-xs font-medium cursor-pointer transition-colors"
                                >
                                    History
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

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
