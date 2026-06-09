// GiftForm is the admin form for creating a new gift product.
// It is used from AdminGifts via the "+ Add New Gift" button.
// Editing an existing gift is handled by EditGiftForm, not this component.
//
// Props:
//   onSuccess - called after the gift is successfully created; triggers a refetch in the parent
//   onClose   - called when the user cancels or clicks the X button
//
// All fields are independent state variables rather than a single form object.
// minimumStockLevel defaults to "10" to match the model's default value.
//
// createGift uses FormData and multipart/form-data because of the optional image upload.
// All fields are always appended to FormData, even optional ones; the backend handles
// blank strings gracefully.
// productImage is only appended when the user has selected a file.
//
// On success, shows a confirmation alert and then calls onSuccess() so the parent
// refetches and shows the new item.

import { useState, useEffect } from "react";
import api from "../api";

function GiftForm({ onSuccess, onClose }) {
  const [categories, setCategories] = useState([]);
  const [productName, setProductName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [qtyStock, setQtyStock] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [description, setDescription] = useState("");
  const [material, setMaterial] = useState("");
  const [hsCode, setHsCode] = useState("");
  const [countryOfOrigin, setCountryOfOrigin] = useState("");
  const [merchantProductId, setMerchantProductId] = useState("");
  const [manufacturerProductId, setManufacturerProductId] = useState("");
  const [standardisedProductId, setStandardisedProductId] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [supplierEmail, setSupplierEmail] = useState("");
  const [supplierPhone, setSupplierPhone] = useState("");
  const [supplierAddress, setSupplierAddress] = useState("");
  const [minimumStockLevel, setMinimumStockLevel] = useState("10");
  const [notes, setNotes] = useState("");
  const [productImage, setProductImage] = useState(null);

  useEffect(() => {
    getCategories();
  }, []);

  const getCategories = () => {
    api
      .get("/api/gifts/categories/")
      .then((res) => res.data)
      .then((data) => setCategories(data))
      .catch((err) => alert(err));
  };

  // Builds a FormData payload and POSTs to create the gift.
  // multipart/form-data is required because of the optional image upload.
  const createGift = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("product_name", productName);
    formData.append("category_id", categoryId);
    formData.append("qty_stock", qtyStock);
    formData.append("unit_price", unitPrice);
    formData.append("description", description);
    formData.append("material", material);
    formData.append("hs_code", hsCode);
    formData.append("country_of_origin", countryOfOrigin);
    formData.append("merchant_product_id", merchantProductId);
    formData.append("manufacturer_product_id", manufacturerProductId);
    formData.append("standardised_product_id", standardisedProductId);
    formData.append("supplier_name", supplierName);
    formData.append("supplier_email", supplierEmail);
    formData.append("supplier_phone", supplierPhone);
    formData.append("supplier_address", supplierAddress);
    formData.append("minimum_stock_level", minimumStockLevel);
    formData.append("notes", notes);

    if (productImage) {
      formData.append("product_image", productImage);
    }

    api
      .post("/api/gifts/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        if (res.status === 201) {
          alert("Gift created!");
          onSuccess();
        } else {
          alert("Failed to create gift.");
        }
      })
      .catch((err) => alert(err));
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full my-8">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-wa-navy">Add New Item</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold cursor-pointer"
            >
              ×
            </button>
          </div>

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
                className="form_input"
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
                className="form_input"
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
                className="form_input"
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
                className="form_input"
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
                className="form_input"
              />
            </div>

            {/* minimumStockLevel defaults to 10 to match the model default */}
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
                className="form_input"
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
                className="form_input min-h-25"
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
                className="form_input"
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
                className="form_input"
              />
            </div>

            <div>
              <label
                htmlFor="merchantProductId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Merchant Product ID
              </label>
              <input
                type="text"
                id="merchantProductId"
                value={merchantProductId}
                onChange={(e) => setMerchantProductId(e.target.value)}
                className="form_input"
              />
            </div>

            <div>
              <label
                htmlFor="manufacturerProductId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Manufacturer Product ID
              </label>
              <input
                type="text"
                id="manufacturerProductId"
                value={manufacturerProductId}
                onChange={(e) => setManufacturerProductId(e.target.value)}
                className="form_input"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="standardisedProductId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Standardised Product ID
              </label>
              <input
                type="text"
                id="standardisedProductId"
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

            <div>
              <label
                htmlFor="supplierPhone"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
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
                Create Item
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default GiftForm;
