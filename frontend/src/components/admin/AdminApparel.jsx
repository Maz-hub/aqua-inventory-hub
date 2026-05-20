/**
 * AdminApparel Component
 *
 * Table view of all apparel products for admin users.
 * Supports search, category filter, low-stock filter,
 * inline stock adjustment, transaction history, and product deletion.
 */

import { useState, useEffect } from "react";
import api from "../../api";
import ApparelDetailsModal from "../ApparelDetailsModal";
import ApparelHistoryModal from "../ApparelHistoryModal";
import ApparelStockAdjustModal from "../ApparelStockAdjustModal";
import AddApparelProductForm from "../AddApparelProductForm";

function AdminApparel() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [showLowStockOnly, setShowLowStockOnly] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [historyProduct, setHistoryProduct] = useState(null);
    const [adjustProduct, setAdjustProduct] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = () => {
        api.get("/api/apparel/products/")
            .then((res) => {
                setProducts(res.data);
                setLoading(false);
            })
            .catch((err) => console.error("Failed to load products:", err));
    };

    const fetchCategories = () => {
        api.get("/api/apparel/categories/")
            .then((res) => setCategories(res.data))
            .catch((err) => console.error("Failed to load categories:", err));
    };

    const isLowStock = (product) =>
        product.variants?.some((v) => v.qty_stock <= v.minimum_stock_level);

    const filteredProducts = products.filter((product) => {
        const matchesSearch = product.product_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        const matchesCategory =
            selectedCategory === "" ||
            product.category.id === parseInt(selectedCategory);
        const matchesLowStock = !showLowStockOnly || isLowStock(product);
        return matchesSearch && matchesCategory && matchesLowStock;
    });

    const filtersActive =
        searchQuery !== "" || selectedCategory !== "" || showLowStockOnly;

    const clearFilters = () => {
        setSearchQuery("");
        setSelectedCategory("");
        setShowLowStockOnly(false);
    };

    const handleDelete = async (product) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${product.product_name}"? This will also delete all its variants and cannot be undone.`
        );
        if (!confirmed) return;
        try {
            await api.delete(`/api/apparel/products/${product.id}/`);
            fetchProducts();
        } catch (err) {
            alert(err.response?.data?.error || "Failed to delete product.");
        }
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Loading apparel...</p>
            </div>
        );
    }

    return (
        <div>
            {/* Toolbar */}
            <div className="flex flex-col gap-3 mb-6">
                {/* Row 1: Search + Category */}
                <div className="flex flex-col md:flex-row gap-3">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="form_input w-full md:flex-1 md:min-w-0"
                    />
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="form_input w-full md:flex-1 md:min-w-0"
                    >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Row 2: Add button (left) | Low Stock + Clear (right) */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="bg-wa-blue text-white px-4 py-2 rounded-lg text-sm hover:bg-wa-ocean transition-colors cursor-pointer w-full md:w-auto"
                    >
                        + Add New Product
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

            {/* Table — desktop */}
            <div className="hidden md:block bg-white rounded-2xl shadow overflow-hidden">
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
                                Variants
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                Price
                            </th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredProducts.map((product) => (
                            <tr
                                key={product.id}
                                className="hover:bg-gray-50 transition-colors"
                            >
                                <td className="px-4 py-3">
                                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                        {product.product_image ? (
                                            <img
                                                src={product.product_image.replace(
                                                    "http://localhost:8000",
                                                    ""
                                                )}
                                                alt={product.product_name}
                                                className="w-full h-full object-contain"
                                            />
                                        ) : (
                                            <span className="text-gray-400 text-xl">👕</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <p className="font-medium text-wa-navy">
                                        {product.product_name}
                                    </p>
                                    {isLowStock(product) && (
                                        <span className="text-xs text-red-500 font-medium">
                                            Low Stock
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                    {product.category.name}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                    {product.variants?.length ?? 0}
                                </td>
                                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                                    CHF {parseFloat(product.unit_price).toFixed(2)}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setSelectedProduct(product)}
                                            className="text-wa-blue hover:text-wa-ocean text-xs font-medium cursor-pointer transition-colors"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => setAdjustProduct(product)}
                                            className="text-wa-cyan hover:text-wa-ocean text-xs font-medium cursor-pointer transition-colors"
                                        >
                                            Adjust Stock
                                        </button>
                                        <button
                                            onClick={() => setHistoryProduct(product)}
                                            className="text-gray-400 hover:text-wa-navy text-xs font-medium cursor-pointer transition-colors"
                                        >
                                            History
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product)}
                                            className="text-red-400 hover:text-red-600 text-xs font-medium cursor-pointer transition-colors"
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
            <div className="md:hidden space-y-3">
                {filteredProducts.map((product) => (
                    <div
                        key={product.id}
                        className="bg-white rounded-2xl shadow p-4"
                    >
                        <div className="flex items-start gap-3">
                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
                                {product.product_image ? (
                                    <img
                                        src={product.product_image.replace(
                                            "http://localhost:8000",
                                            ""
                                        )}
                                        alt={product.product_name}
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <span className="text-gray-400 text-2xl">👕</span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-wa-navy truncate">
                                    {product.product_name}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {product.category.name}
                                </p>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className="text-sm text-gray-600">
                                        {product.variants?.length ?? 0} variant
                                        {product.variants?.length !== 1 ? "s" : ""}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        CHF {parseFloat(product.unit_price).toFixed(2)}
                                    </span>
                                </div>
                                {isLowStock(product) && (
                                    <span className="text-xs text-red-500 font-medium">
                                        Low Stock
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-col gap-2 shrink-0">
                                <button
                                    onClick={() => setSelectedProduct(product)}
                                    className="text-wa-blue hover:text-wa-ocean text-xs font-medium cursor-pointer transition-colors"
                                >
                                    View
                                </button>
                                <button
                                    onClick={() => setAdjustProduct(product)}
                                    className="text-wa-cyan hover:text-wa-ocean text-xs font-medium cursor-pointer transition-colors"
                                >
                                    Adjust Stock
                                </button>
                                <button
                                    onClick={() => setHistoryProduct(product)}
                                    className="text-gray-400 hover:text-wa-navy text-xs font-medium cursor-pointer transition-colors"
                                >
                                    History
                                </button>
                                <button
                                    onClick={() => handleDelete(product)}
                                    className="text-red-400 hover:text-red-600 text-xs font-medium cursor-pointer transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <ApparelDetailsModal
                product={selectedProduct}
                onClose={() => setSelectedProduct(null)}
                onSuccess={fetchProducts}
                isAdmin={true}
            />

            {historyProduct && (
                <ApparelHistoryModal
                    product={historyProduct}
                    onClose={() => setHistoryProduct(null)}
                />
            )}

            {adjustProduct && (
                <ApparelStockAdjustModal
                    product={adjustProduct}
                    onClose={() => setAdjustProduct(null)}
                    onSuccess={() => {
                        setAdjustProduct(null);
                        fetchProducts();
                    }}
                />
            )}

            {showAddForm && (
                <AddApparelProductForm
                    onClose={() => setShowAddForm(false)}
                    onSuccess={() => {
                        setShowAddForm(false);
                        setSearchQuery("");
                        setSelectedCategory("");
                        setShowLowStockOnly(false);
                        fetchProducts();
                    }}
                />
            )}
        </div>
    );
}

export default AdminApparel;
