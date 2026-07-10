/**
 * Edit Executive Form Component
 *
 * Pre-filled form to edit existing executive item information.
 * Updates all fields including product details, customs data, and supplier info.
 * Unlike Gift, unit_price is optional here (not required).
 */

import { useState, useEffect } from "react";
import api from "../api";

function EditExecutiveForm({ item, onClose, onSuccess }) {
  // Form state - initialize with current item data
  const [categories, setCategories] = useState([]);
  const [itemName, setItemName] = useState(item.item_name);
  const [categoryId, setCategoryId] = useState(item.category.id);
  const [unitPrice, setUnitPrice] = useState(item.unit_price || "");
  const [description, setDescription] = useState(item.description || "");
  const [hsCode, setHsCode] = useState(item.hs_code || "");
  const [countryOfOrigin, setCountryOfOrigin] = useState(
    item.country_of_origin || ""
  );
  const [supplierName, setSupplierName] = useState(item.supplier_name || "");
  const [supplierEmail, setSupplierEmail] = useState(item.supplier_email || "");
  const [supplierPhone, setSupplierPhone] = useState(item.supplier_phone || "");
  const [supplierAddress, setSupplierAddress] = useState(
    item.supplier_address || ""
  );
  const [merchantProductId, setMerchantProductId] = useState(item.merchant_product_id || "");
  const [manufacturerProductId, setManufacturerProductId] = useState(item.manufacturer_product_id || "");
  const [standardisedProductId, setStandardisedProductId] = useState(item.standardised_product_id || "");
  const [notes, setNotes] = useState(item.notes || "");
  const [productImage, setProductImage] = useState(null);

  useEffect(() => {
    // Fetch categories for dropdown
    getCategories();
  }, []);

  const getCategories = () => {
    // Fetches all categories from backend
    api
      .get("/api/executive/categories/")
      .then((res) => res.data)
      .then((data) => setCategories(data))
      .catch((err) => alert(err));
  };

  const handleSubmit = (e) => {
    // Prevent form from reloading page
    e.preventDefault();

    // Create FormData to handle file upload and regular fields
    const formData = new FormData();
    formData.append("item_name", itemName);
    formData.append("category_id", categoryId);
    formData.append("unit_price", unitPrice);
    formData.append("description", description);
    formData.append("hs_code", hsCode);
    formData.append("country_of_origin", countryOfOrigin);
    formData.append("supplier_name", supplierName);
    formData.append("supplier_email", supplierEmail);
    formData.append("supplier_phone", supplierPhone);
    formData.append("supplier_address", supplierAddress);
    formData.append("merchant_product_id", merchantProductId);
    formData.append("manufacturer_product_id", manufacturerProductId);
    formData.append("standardised_product_id", standardisedProductId);
    formData.append("notes", notes);

    // Add new image only if user selected one
    if (productImage) {
      formData.append("product_image", productImage);
    }

    // Send PATCH request to update item
    api
      .patch(`/api/executive/update/${item.id}/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        if (res.status === 200) {
          alert("Product updated successfully!");
          onSuccess(); // Refresh item list
          onClose(); // Close edit form
        }
      })
      .catch((err) => {
        alert(err.response?.data?.error || "Failed to update product");
      });
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full my-8">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-wa-navy">Edit Product</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold cursor-pointer"
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
                Item Information
              </h3>
            </div>

            {/* Product Image Upload */}
            <div className="md:col-span-2">
              <label
                htmlFor="productImage"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Product Image{" "}
                {item.product_image && "(Leave empty to keep current image)"}
              </label>
              <input
                type="file"
                id="productImage"
                accept="image/*"
                onChange={(e) => setProductImage(e.target.files[0])}
                className="w-full px-4 py-2 border border-gray-300 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-wa-cyan focus:border-wa-cyan transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-wa-blue file:text-white hover:file:bg-wa-ocean"
              />
            </div>

            {/* Item Name */}
            <div>
              <label
                htmlFor="itemName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Item Name *
              </label>
              <input
                type="text"
                id="itemName"
                required
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="form_input"
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
                className="form_input"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Unit Price */}
            <div>
              <label
                htmlFor="unitPrice"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Unit Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                id="unitPrice"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                className="form_input"
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
                className="form_input min-h-25"
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
                className="form_input"
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
                className="form_input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Merchant Product ID
              </label>
              <input
                type="text"
                value={merchantProductId}
                onChange={(e) => setMerchantProductId(e.target.value)}
                className="form_input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Manufacturer Product ID
              </label>
              <input
                type="text"
                value={manufacturerProductId}
                onChange={(e) => setManufacturerProductId(e.target.value)}
                className="form_input"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Standardised Product ID
              </label>
              <input
                type="text"
                value={standardisedProductId}
                onChange={(e) => setStandardisedProductId(e.target.value)}
                className="form_input"
                placeholder="e.g. GTIN / EAN / ISBN"
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
                className="form_input"
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
                className="form_input"
              />
            </div>

            {/* Supplier Phone */}
            <div>
              <label htmlFor="supplierPhone" className="block text-sm font-medium text-gray-700 mb-2">
                Supplier Phone
              </label>
              <input
                type="tel"
                id="supplierPhone"
                value={supplierPhone}
                onChange={(e) => setSupplierPhone(e.target.value)}
                className="form_input"
                placeholder="+41 XX XXX XX XX"
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
                className="form_input min-h-20"
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
                className="form_input min-h-20"
              />
            </div>

            {/* Action Buttons */}
            <div className="md:col-span-2 mt-4 flex gap-3">
              <button type="button" onClick={onClose} className="btn_cancel">
                Cancel
              </button>
              <button type="submit" className="btn_confirm">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditExecutiveForm;
