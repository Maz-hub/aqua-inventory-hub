/**
 * Edit Gift Form Component
 *
 * Pre-filled form to edit existing gift product information.
 * Updates all fields including product details, customs data, and supplier info.
 */

import { useState, useEffect } from "react";
import api from "../api";

function EditGiftForm({ gift, onClose, onSuccess }) {
  // Form state - initialize with current gift data
  const [categories, setCategories] = useState([]);
  const [productName, setProductName] = useState(gift.product_name);
  const [categoryId, setCategoryId] = useState(gift.category.id);
  const [qtyStock, setQtyStock] = useState(gift.qty_stock);
  const [unitPrice, setUnitPrice] = useState(gift.unit_price);
  const [description, setDescription] = useState(gift.description || "");
  const [material, setMaterial] = useState(gift.material || "");
  const [hsCode, setHsCode] = useState(gift.hs_code || "");
  const [countryOfOrigin, setCountryOfOrigin] = useState(
    gift.country_of_origin || ""
  );
  const [supplierName, setSupplierName] = useState(gift.supplier_name || "");
  const [supplierEmail, setSupplierEmail] = useState(gift.supplier_email || "");
  const [supplierAddress, setSupplierAddress] = useState(
    gift.supplier_address || ""
  );
  const [minimumStockLevel, setMinimumStockLevel] = useState(
    gift.minimum_stock_level
  );
  const [notes, setNotes] = useState(gift.notes || "");
  const [productImage, setProductImage] = useState(null);

  useEffect(() => {
    // Fetch categories for dropdown
    getCategories();
  }, []);

  const getCategories = () => {
    // Fetches all categories from backend
    api
      .get("/api/categories/")
      .then((res) => res.data)
      .then((data) => setCategories(data))
      .catch((err) => alert(err));
  };

  const handleSubmit = (e) => {
    // Prevent form from reloading page
    e.preventDefault();

    // Create FormData to handle file upload and regular fields
    const formData = new FormData();
    formData.append("product_name", productName);
    formData.append("category_id", categoryId);
    formData.append("qty_stock", qtyStock);
    formData.append("unit_price", unitPrice);
    formData.append("description", description);
    formData.append("material", material);
    formData.append("hs_code", hsCode);
    formData.append("country_of_origin", countryOfOrigin);
    formData.append("supplier_name", supplierName);
    formData.append("supplier_email", supplierEmail);
    formData.append("supplier_address", supplierAddress);
    formData.append("minimum_stock_level", minimumStockLevel);
    formData.append("notes", notes);

    // Add new image only if user selected one
    if (productImage) {
      formData.append("product_image", productImage);
    }

    // Send PATCH request to update gift
    api
      .patch(`/api/gifts/update/${gift.id}/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        if (res.status === 200) {
          alert("Product updated successfully!");
          onSuccess(); // Refresh gift list
          onClose(); // Close edit form
        }
      })
      .catch((err) => {
        alert(err.response?.data?.error || "Failed to update product");
      });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full my-8">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-wa-navy">Edit Product</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {/* Product Information Section */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-wa-navy mb-4 border-b pb-2">
                Product Information
              </h3>
            </div>

            {/* Product Image Upload */}
            <div className="md:col-span-2">
              <label
                htmlFor="productImage"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Product Image{" "}
                {gift.product_image && "(Leave empty to keep current image)"}
              </label>
              <input
                type="file"
                id="productImage"
                accept="image/*"
                onChange={(e) => setProductImage(e.target.files[0])}
                className="w-full px-4 py-2 border border-gray-300 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-wa-cyan focus:border-wa-cyan transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-wa-blue file:text-white hover:file:bg-wa-ocean"
              />
            </div>

            {/* Product Name */}
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

            {/* Category */}
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
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label
                htmlFor="qtyStock"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Quantity in Stock *
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

            {/* Unit Price */}
            <div>
              <label
                htmlFor="unitPrice"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Unit Price ($) *
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

            {/* Material */}
            <div>
              <label
                htmlFor="material"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Material
              </label>
              <input
                type="text"
                id="material"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wa-cyan focus:border-wa-cyan transition-colors"
              />
            </div>

            {/* Minimum Stock Level */}
            <div>
              <label
                htmlFor="minimumStockLevel"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Minimum Stock Level
              </label>
              <input
                type="number"
                id="minimumStockLevel"
                value={minimumStockLevel}
                onChange={(e) => setMinimumStockLevel(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wa-cyan focus:border-wa-cyan transition-colors"
              />
            </div>

            {/* Description */}
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
                className="w-full px-4 py-2 border border-gray-300 rounded-md min-h-25 resize-y focus:outline-none focus:ring-2 focus:ring-wa-cyan focus:border-wa-cyan transition-colors"
              />
            </div>

            {/* Customs & Logistics Section */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-lg font-semibold text-wa-navy mb-4 border-b pb-2">
                Customs & Logistics
              </h3>
            </div>

            {/* HS Code */}
            <div>
              <label
                htmlFor="hsCode"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                HS Code
              </label>
              <input
                type="text"
                id="hsCode"
                value={hsCode}
                onChange={(e) => setHsCode(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wa-cyan focus:border-wa-cyan transition-colors"
              />
            </div>

            {/* Country of Origin */}
            <div>
              <label
                htmlFor="countryOfOrigin"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Country of Origin
              </label>
              <input
                type="text"
                id="countryOfOrigin"
                value={countryOfOrigin}
                onChange={(e) => setCountryOfOrigin(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wa-cyan focus:border-wa-cyan transition-colors"
              />
            </div>

            {/* Supplier Information Section */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-lg font-semibold text-wa-navy mb-4 border-b pb-2">
                Supplier Information
              </h3>
            </div>

            {/* Supplier Name */}
            <div>
              <label
                htmlFor="supplierName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Supplier Name
              </label>
              <input
                type="text"
                id="supplierName"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wa-cyan focus:border-wa-cyan transition-colors"
              />
            </div>

            {/* Supplier Email */}
            <div>
              <label
                htmlFor="supplierEmail"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Supplier Email
              </label>
              <input
                type="email"
                id="supplierEmail"
                value={supplierEmail}
                onChange={(e) => setSupplierEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wa-cyan focus:border-wa-cyan transition-colors"
              />
            </div>

            {/* Supplier Address */}
            <div className="md:col-span-2">
              <label
                htmlFor="supplierAddress"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Supplier Address
              </label>
              <textarea
                id="supplierAddress"
                value={supplierAddress}
                onChange={(e) => setSupplierAddress(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md min-h-20 resize-y focus:outline-none focus:ring-2 focus:ring-wa-cyan focus:border-wa-cyan transition-colors"
              />
            </div>

            {/* Internal Notes Section */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-lg font-semibold text-wa-navy mb-4 border-b pb-2">
                Internal Notes
              </h3>
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Notes
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md min-h-20 resize-y focus:outline-none focus:ring-2 focus:ring-wa-cyan focus:border-wa-cyan transition-colors"
              />
            </div>

            {/* Action Buttons */}
            <div className="md:col-span-2 mt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-md hover:bg-gray-300 cursor-pointer transition-all font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-wa-blue text-white py-2 rounded-md hover:bg-wa-ocean cursor-pointer transition-all font-medium"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditGiftForm;
