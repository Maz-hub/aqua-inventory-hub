/**
 * Gifts Inventory Page
 *
 * Displays all promotional items and office supplies.
 * Features:
 * - Grid view of all gifts
 * - Add new gift form
 * - Edit/Delete functionality
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function Gifts() {
  // Main component function for Gifts Inventory page

  const [gifts, setGifts] = useState([]);
  // State: Stores array of gift objects fetched from Django backend

  const [loading, setLoading] = useState(true);
  // State: Tracks loading status during API requests

  const [categories, setCategories] = useState([]);
  // State: Stores list of available categories for dropdown

  // Form state for creating new gifts
  const [productName, setProductName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [qtyStock, setQtyStock] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [description, setDescription] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    // Runs once when component mounts
    getGifts();
    getCategories();
  }, []);

  const getGifts = () => {
    // Fetches all gifts from Django backend API
    api
      .get("/api/gifts/")
      .then((res) => res.data)
      .then((data) => {
        setGifts(data);
        setLoading(false);
      })
      .catch((err) => {
        alert(err);
        setLoading(false);
      });
  };

  const getCategories = () => {
    // Fetches all categories for the dropdown
    api
      .get("/api/categories/")
      .then((res) => res.data)
      .then((data) => {
        setCategories(data);
      })
      .catch((err) => alert(err));
  };

  const deleteGift = (id) => {
    // Deletes a gift from inventory
    api
      .delete(`/api/gifts/delete/${id}/`)
      .then((res) => {
        if (res.status === 204) {
          alert("Gift deleted!");
          getGifts();
        } else {
          alert("Failed to delete gift.");
        }
      })
      .catch((error) => alert(error));
  };

  const createGift = (e) => {
    // Creates a new gift in inventory
    e.preventDefault();
    // Prevents default form submission (page reload)

    api
      .post("/api/gifts/", {
        product_name: productName,
        category_id: categoryId,
        qty_stock: qtyStock,
        unit_price: unitPrice,
        description: description,
      })
      .then((res) => {
        if (res.status === 201) {
          alert("Gift created!");
          // Clear form fields
          setProductName("");
          setCategoryId("");
          setQtyStock("");
          setUnitPrice("");
          setDescription("");
          getGifts();
        } else {
          alert("Failed to create gift.");
        }
      })
      .catch((err) => alert(err));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading gifts...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <button
          onClick={() => navigate("/")}
          className="mb-4 text-wa-blue hover:text-wa-ocean flex items-center gap-2 cursor-pointer font-medium transition-colors"
        >
          ← Back to Home
        </button>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-wa-navy mb-2">
              Gifts Inventory
            </h1>
            <p className="text-gray-600">{gifts.length} items in stock</p>
          </div>
        </div>

        {/* Create Gift Form */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-2xl font-bold text-wa-navy mb-4">Add New Item</h2>

          <form
            onSubmit={createGift}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label
                htmlFor="productName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Product Name *
              </label>
              <input
                type="text"
                id="productName"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wa-cyan focus:border-wa-cyan transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Category *
              </label>
              <select
                id="category"
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-wa-cyan focus:border-wa-cyan transition-colors"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="qtyStock"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Quantity *
              </label>
              <input
                type="number"
                id="qtyStock"
                required
                value={qtyStock}
                onChange={(e) => setQtyStock(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wa-cyan focus:border-wa-cyan transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="unitPrice"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Unit Price *
              </label>
              <input
                type="number"
                step="0.01"
                id="unitPrice"
                required
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wa-cyan focus:border-wa-cyan transition-colors"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md min-h-[100px] resize-y focus:outline-none focus:ring-2 focus:ring-wa-cyan focus:border-wa-cyan transition-colors"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="bg-wa-blue text-white px-6 py-3 rounded-md font-medium hover:bg-wa-ocean cursor-pointer transition-all duration-200"
              >
                Add Gift
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Gifts Grid */}
      <div className="max-w-7xl mx-auto">
        {gifts.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow text-center">
            <p className="text-gray-500 text-lg">
              No gifts in inventory yet. Add your first item above!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {gifts.map((gift) => (
              <div
                key={gift.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
              >
                {/* Gift Image */}
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  {gift.product_image ? (
                    <img
                      src={gift.product_image}
                      alt={gift.product_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-4xl">📦</span>
                  )}
                </div>

                {/* Gift Details */}
                <div className="p-4">
                  <h3 className="font-bold text-lg text-wa-navy mb-1 truncate">
                    {gift.product_name}
                  </h3>

                  <p className="text-sm text-wa-blue mb-2">
                    {gift.category.name}
                  </p>

                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-600">
                      Stock: <strong>{gift.qty_stock}</strong>
                    </span>
                    <span className="text-gray-600">${gift.unit_price}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button className="flex-1 bg-wa-blue text-white py-2 rounded-md hover:bg-wa-ocean text-sm font-medium cursor-pointer transition-all">
                      Edit
                    </button>
                    <button
                      onClick={() => deleteGift(gift.id)}
                      className="flex-1 bg-wa-red text-white py-2 rounded-md hover:bg-red-700 text-sm font-medium cursor-pointer transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Gifts;
