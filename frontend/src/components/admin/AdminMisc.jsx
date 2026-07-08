// AdminMisc renders the miscellaneous inventory table inside the Admin Panel.
// No props — it fetches its own data on mount.
//
// State overview:
//   items            - full list fetched from the API
//   loading          - shows a loading message until the first fetch completes
//   categories       - list for the category filter dropdown
//   searchQuery      - live text filter applied to item names
//   selectedCategory - category ID filter; empty string means "all"
//   showLowStockOnly - when true, only shows items at or below qty_stock 0 (out of stock)
//   selectedItem     - when set to an item object, opens MiscDetailsModal
//   historyItem      - when set to an item object, opens MiscHistoryModal
//   adjustItem       - when set to an item object, opens MiscStockAdjustModal
//   showAddForm      - controls visibility of the AddMiscForm modal
//
// Price column shows the real unit_price when one is set, and "—" only when there is none.

import { useState, useEffect } from "react";
import api from "../../api";
import MiscDetailsModal from "../MiscDetailsModal";
import MiscHistoryModal from "../MiscHistoryModal";
import MiscStockAdjustModal from "../MiscStockAdjustModal";
import AddMiscForm from "../AddMiscForm";

function AdminMisc() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [showLowStockOnly, setShowLowStockOnly] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [historyItem, setHistoryItem] = useState(null);
    const [adjustItem, setAdjustItem] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);

    useEffect(() => {
        fetchItems();
        fetchCategories();
    }, []);

    const fetchItems = () => {
        api.get("/api/miscellaneous/")
            .then((res) => {
                setItems(res.data);
                setLoading(false);
            })
            .catch((err) => console.error("Failed to load miscellaneous items:", err));
    };

    const fetchCategories = () => {
        api.get("/api/miscellaneous/categories/")
            .then((res) => setCategories(res.data))
            .catch((err) => console.error("Failed to load categories:", err));
    };

    const filteredItems = items.filter((item) => {
        const matchesSearch = item.item_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        const matchesCategory =
            selectedCategory === "" ||
            item.category.id === parseInt(selectedCategory);
        const matchesLowStock = !showLowStockOnly || item.qty_stock === 0;
        return matchesSearch && matchesCategory && matchesLowStock;
    });

    const filtersActive = searchQuery !== "" || selectedCategory !== "" || showLowStockOnly;

    const clearFilters = () => {
        setSearchQuery("");
        setSelectedCategory("");
        setShowLowStockOnly(false);
    };

    const handleDelete = async (item) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${item.item_name}"? This cannot be undone.`
        );
        if (!confirmed) return;
        try {
            await api.delete(`/api/miscellaneous/delete/${item.id}/`);
            fetchItems();
        } catch (err) {
            alert(err.response?.data?.error || "Failed to delete item.");
        }
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Loading miscellaneous items...</p>
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
                        placeholder="Search items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="form_input w-full xl:flex-1 xl:min-w-0"
                    />
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="form_input w-full xl:flex-1 xl:min-w-0"
                    >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
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
                        + Add New Item
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
                            {showLowStockOnly ? "✓ Out of Stock Only" : "Show Out of Stock"}
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
                                Item
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                Category
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                Department
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
                        {filteredItems.map((item) => (
                            <tr
                                key={item.id}
                                className="hover:bg-gray-50 transition-colors"
                            >
                                <td className="px-4 py-3">
                                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                        {item.product_image ? (
                                            <img
                                                src={item.product_image.replace("http://localhost:8000", "")}
                                                alt={item.item_name}
                                                className="w-full h-full object-contain"
                                            />
                                        ) : (
                                            <span className="text-gray-400 text-xl">📋</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <p className="font-medium text-wa-navy">{item.item_name}</p>
                                    {item.qty_stock === 0 && (
                                        <span className="text-xs text-red-500 font-medium">Out of Stock</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                    {item.category.name}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                    {item.department?.name || "—"}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`font-semibold ${item.qty_stock === 0 ? "text-red-500" : "text-wa-navy"}`}>
                                        {item.qty_stock}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                                    {item.unit_price
                                        ? `$ ${parseFloat(item.unit_price).toFixed(2)}`
                                        : "—"}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-2 justify-between">
                                        <button
                                            onClick={() => setSelectedItem(item)}
                                            className="text-wa-blue hover:text-wa-ocean border border-wa-blue hover:border-wa-ocean text-xs font-medium cursor-pointer transition-colors px-2 py-0.5 rounded"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => setAdjustItem(item)}
                                            className="text-wa-cyan hover:text-wa-ocean border border-wa-cyan hover:border-wa-ocean text-xs font-medium cursor-pointer transition-colors px-2 py-0.5 rounded"
                                        >
                                            Adjust Stock
                                        </button>
                                        <button
                                            onClick={() => setHistoryItem(item)}
                                            className="text-gray-400 hover:text-wa-navy border border-gray-300 hover:border-wa-navy text-xs font-medium cursor-pointer transition-colors px-2 py-0.5 rounded"
                                        >
                                            History
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item)}
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
                {filteredItems.map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl shadow p-4">
                        <div className="flex items-start gap-3">
                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
                                {item.product_image ? (
                                    <img
                                        src={item.product_image.replace("http://localhost:8000", "")}
                                        alt={item.item_name}
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <span className="text-gray-400 text-2xl">📋</span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-wa-navy truncate">{item.item_name}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{item.category.name}</p>
                                {item.department && (
                                    <p className="text-xs text-gray-400">{item.department.name}</p>
                                )}
                                <p className="text-sm text-gray-600 mt-2">
                                    Stock: {item.qty_stock}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {item.unit_price
                                        ? `$ ${parseFloat(item.unit_price).toFixed(2)}`
                                        : "—"}
                                </p>
                                {item.qty_stock === 0 && (
                                    <span className="text-xs text-red-500 font-medium">Out of Stock</span>
                                )}
                            </div>
                            <div className="flex flex-col gap-2 shrink-0">
                                <button
                                    onClick={() => setSelectedItem(item)}
                                    className="text-wa-blue hover:text-wa-ocean border border-wa-blue hover:border-wa-ocean text-xs font-medium cursor-pointer transition-colors px-2 py-0.5 rounded"
                                >
                                    View
                                </button>
                                <button
                                    onClick={() => setAdjustItem(item)}
                                    className="text-wa-cyan hover:text-wa-ocean border border-wa-cyan hover:border-wa-ocean text-xs font-medium cursor-pointer transition-colors px-2 py-0.5 rounded"
                                >
                                    Adjust Stock
                                </button>
                                <button
                                    onClick={() => setHistoryItem(item)}
                                    className="text-gray-400 hover:text-wa-navy border border-gray-300 hover:border-wa-navy text-xs font-medium cursor-pointer transition-colors px-2 py-0.5 rounded"
                                >
                                    History
                                </button>
                                <button
                                    onClick={() => handleDelete(item)}
                                    className="text-red-400 hover:text-red-600 border border-red-300 hover:border-red-500 text-xs font-medium cursor-pointer transition-colors px-2 py-0.5 rounded"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* MiscDetailsModal is always mounted; it handles a null item prop internally */}
            <MiscDetailsModal
                item={selectedItem}
                onClose={() => setSelectedItem(null)}
                onSuccess={fetchItems}
                isAdmin={true}
            />

            {historyItem && (
                <MiscHistoryModal
                    item={historyItem}
                    onClose={() => setHistoryItem(null)}
                />
            )}

            {adjustItem && (
                <MiscStockAdjustModal
                    item={adjustItem}
                    onClose={() => setAdjustItem(null)}
                    onSuccess={() => {
                        setAdjustItem(null);
                        fetchItems();
                    }}
                />
            )}

            {showAddForm && (
                <AddMiscForm
                    onClose={() => setShowAddForm(false)}
                    onSuccess={() => {
                        setShowAddForm(false);
                        setSearchQuery("");
                        setSelectedCategory("");
                        fetchItems();
                    }}
                />
            )}
        </div>
    );
}

export default AdminMisc;
