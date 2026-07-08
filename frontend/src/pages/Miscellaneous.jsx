// Miscellaneous is the public-facing Miscellaneous inventory page for all authenticated users.
// No props — it fetches its own data on mount.
//
// State overview:
//   items            - full list of miscellaneous items from the API
//   loading          - shows nothing until the first fetch completes
//   selectedItem     - when set, opens MiscDetailsModal
//   searchQuery      - live text filter on item name
//   selectedCategory - category ID filter; empty string means "all"
//   categories       - list for the category dropdown
//   showFilters      - toggled by the mobile Filters button
//   selectionOpen    - controls SelectionDrawer visibility
//
// filteredItems is derived on every render by applying the search and category filters.
// MiscDetailsModal is always mounted and handles a null item prop internally.

import { useState, useEffect } from "react";
import api from "../api";
import MiscDetailsModal from "../components/MiscDetailsModal";
import SelectionDrawer from "../components/SelectionDrawer";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MiscRequestModal from "../components/MiscRequestModal";

function Miscellaneous() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [categories, setCategories] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [selectionOpen, setSelectionOpen] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [selectedItemForRequest, setSelectedItemForRequest] = useState(null);

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
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    };

    const fetchCategories = () => {
        api.get("/api/miscellaneous/categories/")
            .then((res) => setCategories(res.data))
            .catch((err) => console.error(err));
    };

    const filteredItems = items.filter((item) => {
        const matchesSearch = item.item_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        const matchesCategory =
            selectedCategory === "" ||
            item.category.id === parseInt(selectedCategory);
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Header onSelectionOpen={() => setSelectionOpen(true)} />
            <div className="p-4 md:p-8">
                <div className="max-w-7xl mx-auto mb-8">
                    <div className="flex justify-center items-center mb-8">
                        <div>
                            <h1 className="text-4xl font-bold text-wa-navy mb-2 text-center">
                                Miscellaneous
                            </h1>
                            <p className="text-gray-600 text-center">
                                {filteredItems.length} items available
                            </p>
                        </div>
                    </div>

                    {/* Search and Filter Bar */}
                    <div className="bg-white p-4 rounded-lg shadow mb-6">
                        {/* Mobile: Show Filters Button */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="md:hidden w-full flex items-center justify-between px-4 py-2 bg-wa-navy text-white rounded-md font-medium mb-4"
                        >
                            <span>Filters</span>
                            <span className="text-xl">{showFilters ? "−" : "+"}</span>
                        </button>

                        <div className={`${showFilters ? "block" : "hidden"} md:block`}>
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        placeholder="Search items by name..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="form_input"
                                    />
                                </div>
                                <div>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="form_input"
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="md:w-32">
                                    <button
                                        onClick={() => {
                                            setSearchQuery("");
                                            setSelectedCategory("");
                                        }}
                                        className="w-full px-4 py-2 bg-gray-500 text-white rounded-md font-medium hover:bg-gray-600 transition-colors h-full"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Items Grid */}
                <div className="max-w-7xl mx-auto">
                    {loading ? null : filteredItems.length === 0 ? (
                        <div className="bg-white p-12 rounded-lg shadow text-center">
                            <p className="text-gray-500 text-lg">
                                No items found. Try adjusting your filters.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
                                >
                                    <div className="h-48 bg-white flex items-center justify-center overflow-hidden">
                                        {item.product_image ? (
                                            <img
                                                src={item.product_image.replace("http://localhost:8000", "")}
                                                alt={item.item_name}
                                                className="w-full h-full object-contain p-2"
                                                onError={(e) => { e.target.style.display = "none"; }}
                                            />
                                        ) : (
                                            <span className="text-gray-400 text-4xl">📋</span>
                                        )}
                                    </div>

                                    <div className="p-4">
                                        <h3 className="font-bold text-lg text-wa-navy mb-1 truncate">
                                            {item.item_name}
                                        </h3>

                                        <div className="flex justify-between items-center my-3">
                                            <span className="text-gray-600 text-sm">
                                                Stock: <strong>{item.qty_stock}</strong>
                                            </span>
                                            <span className="text-sm text-wa-blue">
                                                {item.category.name}
                                            </span>
                                        </div>

                                        {/* Department — shown only if set */}
                                        {item.department && (
                                            <p className="text-xs text-gray-500 mb-3">
                                                {item.department.name}
                                            </p>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="space-y-2">
                                            {/* Add to Request is disabled when out of stock */}
                                            <button
                                                onClick={() => {
                                                    setSelectedItemForRequest(item);
                                                    setShowRequestModal(true);
                                                }}
                                                disabled={item.qty_stock === 0}
                                                className={`w-full py-2 rounded-md font-medium transition-colors cursor-pointer
                                                    ${item.qty_stock === 0
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        : 'bg-wa-cyan hover:bg-wa-ocean text-white'
                                                    }`}
                                            >
                                                {item.qty_stock === 0 ? 'Out of Stock' : '+ Add to Request'}
                                            </button>

                                            <button
                                                onClick={() => setSelectedItem(item)}
                                                className="btn_main"
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* MiscDetailsModal is always mounted; handles a null item prop internally */}
                    <MiscDetailsModal
                        item={selectedItem}
                        onClose={() => setSelectedItem(null)}
                        onSuccess={fetchItems}
                    />
                </div>
            </div>
            {/* MiscRequestModal opens when the user clicks Add to Request on a card.
                On close, also opens the SelectionDrawer so the user can review their basket. */}
            {showRequestModal && selectedItemForRequest && (
                <MiscRequestModal
                    item={selectedItemForRequest}
                    onClose={() => {
                        setShowRequestModal(false);
                        setSelectedItemForRequest(null);
                        setSelectionOpen(true);
                    }}
                />
            )}
            <Footer />
            <SelectionDrawer
                isOpen={selectionOpen}
                onClose={() => setSelectionOpen(false)}
            />
        </div>
    );
}

export default Miscellaneous;
