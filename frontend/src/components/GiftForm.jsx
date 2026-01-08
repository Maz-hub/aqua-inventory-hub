/**
 * Gift Form Component
 *
 * Reusable form for creating and editing gifts.
 * Handles all gift fields including product info, customs, and supplier data.
 */

import { useState, useEffect } from "react";
import api from "../api";

function GiftForm({ onSuccess }) {
  // Form state for all gift fields
  const [categories, setCategories] = useState([]);
  const [productName, setProductName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [qtyStock, setQtyStock] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [description, setDescription] = useState("");
  const [material, setMaterial] = useState("");
  const [hsCode, setHsCode] = useState("");
  const [countryOfOrigin, setCountryOfOrigin] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [supplierEmail, setSupplierEmail] = useState("");
  const [supplierAddress, setSupplierAddress] = useState("");
  const [minimumStockLevel, setMinimumStockLevel] = useState("10");
  const [notes, setNotes] = useState("");
  const [productImage, setProductImage] = useState(null);

  useEffect(() => {
    getCategories();
  }, []);

  const getCategories = () => {
    api
      .get("/api/categories/")
      .then((res) => res.data)
      .then((data) => setCategories(data))
      .catch((err) => alert(err));
  };

  const createGift = (e) => {
    e.preventDefault();

    // Create FormData to handle file upload
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

    // Add image if selected
    if (productImage) {
      formData.append("product_image", productImage);
    }

    api
      .post("/api/gifts/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        if (res.status === 201) {
          alert("Gift created!");
          // Clear ALL form fields including image
          setProductName("");
          setCategoryId("");
          setQtyStock("");
          setUnitPrice("");
          setDescription("");
          setMaterial("");
          setHsCode("");
          setCountryOfOrigin("");
          setSupplierName("");
          setSupplierEmail("");
          setSupplierAddress("");
          setMinimumStockLevel("10");
          setNotes("");
          setProductImage(null);
          // Reset file input
          document.getElementById("productImage").value = "";
          onSuccess();
        } else {
          alert("Failed to create gift.");
        }
      })
      .catch((err) => alert(err));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-8">
      <h2 className="text-2xl font-bold text-wa-navy mb-4">Add New Item</h2>

      <form
        onSubmit={createGift}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Product Information Section */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold text-wa-navy mb-4 border-b pb-2">
            Product Information
          </h3>
        </div>

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
            placeholder="Enter product name (e.g., Aqua Blue Cap)"
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
            Quantity in Stock *
          </label>
          <input
            type="number"
            id="qtyStock"
            required
            value={qtyStock}
            onChange={(e) => setQtyStock(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wa-cyan focus:border-wa-cyan transition-colors"
            placeholder="Enter quantity (e.g., 50)"
          />
        </div>

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
            placeholder="Enter price (e.g., 12.99)"
          />
        </div>

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
            placeholder="Enter material (e.g., 87% Nylon 13% Spandex)"
          />
        </div>

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
            placeholder="Alert threshold (e.g., 10)"
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
            className="w-full px-4 py-2 border border-gray-300 rounded-md min-h-25 resize-y focus:outline-none focus:ring-2 focus:ring-wa-cyan focus:border-wa-cyan transition-colors"
            placeholder="Enter detailed product description (weight, color, etc.)"
          />
        </div>

        {/* Product Image Upload */}
        <div className="md:col-span-2">
          <label
            htmlFor="productImage"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Product Image
          </label>
          <input
            type="file"
            id="productImage"
            accept="image/*"
            onChange={(e) => setProductImage(e.target.files[0])}
            className="w-full px-4 py-2 border border-gray-300 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-wa-cyan focus:border-wa-cyan transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-wa-blue file:text-white hover:file:bg-wa-ocean"
          />
          <p className="text-sm text-gray-500 mt-1">
            Accepted formats: JPG, PNG, GIF (Max 5MB)
          </p>
        </div>

        {/* Customs & Logistics Section */}
        <div className="md:col-span-2 mt-4">
          <h3 className="text-lg font-semibold text-wa-navy mb-4 border-b pb-2">
            Customs & Logistics
          </h3>
        </div>

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
            placeholder="Enter HS code (e.g., 6505.00.30)"
          />
        </div>

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
            placeholder="Enter country (e.g., China, USA, Italy)"
          />
        </div>

        {/* Supplier Information Section */}
        <div className="md:col-span-2 mt-4">
          <h3 className="text-lg font-semibold text-wa-navy mb-4 border-b pb-2">
            Supplier Information
          </h3>
        </div>

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
            placeholder="Enter supplier name or company"
          />
        </div>

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
            placeholder="Enter supplier email (e.g., orders@supplier.com)"
          />
        </div>

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
            placeholder="Enter full supplier address with city and country"
          />
        </div>

        {/* Internal Notes Section */}
        <div className="md:col-span-2 mt-4">
          <h3 className="text-lg font-semibold text-wa-navy mb-4 border-b pb-2">
            Internal Notes
          </h3>
        </div>

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
            placeholder="Enter any internal notes or special instructions..."
          />
        </div>

        {/* Submit Button */}
        <div className="md:col-span-2 mt-4">
          <button
            type="submit"
            className="bg-wa-blue text-white px-6 py-3 rounded-md font-medium hover:bg-wa-ocean cursor-pointer transition-all duration-200"
          >
            Add Item to Inventory
          </button>
        </div>
      </form>
    </div>
  );
}

export default GiftForm;
