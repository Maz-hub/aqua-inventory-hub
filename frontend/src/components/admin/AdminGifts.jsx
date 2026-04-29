/**
 * AdminGifts Component
 *
 * Shopify-style table view of all gifts for admin users.
 * Supports checkbox selection, inline stock adjustment,
 * and product editing. Used inside the Admin Panel.
 */

import { useState, useEffect } from "react";
import api from "../../api";

function AdminGifts() {
    const [gifts, setGifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [categories, setCategories] = useState([]);
    const [editingGift, setEditingGift] = useState(null);
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
        return matchesSearch && matchesCategory;
    });

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
            <div className="flex flex-wrap gap-3 mb-6 items-center justify-between">
                <div className="flex flex-wrap gap-3 flex-1">
                    <input
                        type="text"
                        placeholder="Search gifts..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="form_input flex-1 min-w-48"
                    />
                    <select
                        value={selectedCategory}
                        onChange={e => setSelectedCategory(e.target.value)}
                        className="form_input"
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={() => setEditingGift({})}
                    className="bg-wa-blue text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-wa-ocean transition-colors cursor-pointer whitespace-nowrap"
                >
                    + Add New Gift
                </button>
            </div>

            {/* Selected actions bar */}
            {selected.length > 0 && (
                <div className="bg-wa-blue/10 border border-wa-blue/20 rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
                    <p className="text-sm font-medium text-wa-navy">
                        {selected.length} item{selected.length !== 1 ? "s" : ""} selected
                    </p>
                    <button
                        onClick={() => {
                            if (selected.length === 1) {
                                const gift = gifts.find(g => g.id === selected[0]);
                                setEditingGift(gift);
                            } else {
                                alert("Please select only one item to edit.");
                            }
                        }}
                        className="text-sm bg-wa-blue text-white px-4 py-1.5 rounded-lg cursor-pointer hover:bg-wa-ocean transition-colors"
                    >
                        Edit Selected
                    </button>
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
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">HS Code</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Supplier</th>
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
                                <td className="px-4 py-3 text-gray-500 text-xs">{gift.hs_code || "—"}</td>
                                <td className="px-4 py-3 text-gray-500 text-xs">{gift.supplier_name || "—"}</td>
                                <td className="px-4 py-3">
                                    <button
                                        onClick={() => setEditingGift(gift)}
                                        className="text-wa-blue hover:text-wa-ocean text-xs font-medium cursor-pointer transition-colors"
                                    >
                                        Edit
                                    </button>
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
                            <button
                                onClick={() => setEditingGift(gift)}
                                className="text-wa-blue hover:text-wa-ocean text-xs font-medium cursor-pointer transition-colors shrink-0"
                            >
                                Edit
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Modal placeholder */}
            {editingGift && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-wa-navy">
                                {editingGift.id ? `Edit: ${editingGift.product_name}` : "Add New Gift"}
                            </h2>
                            <button
                                onClick={() => setEditingGift(null)}
                                className="text-gray-400 hover:text-gray-600 cursor-pointer text-2xl leading-none"
                            >×</button>
                        </div>
                        <p className="text-gray-500 text-sm">
                            Edit form coming in next step...
                        </p>
                        <button
                            onClick={() => setEditingGift(null)}
                            className="mt-4 w-full py-2 bg-gray-100 rounded-xl text-gray-600 cursor-pointer hover:bg-gray-200 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminGifts;
