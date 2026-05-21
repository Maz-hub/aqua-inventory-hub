/**
 * Add Apparel Product Form Component
 *
 * Creates a base apparel product and optional size/color variants in one step.
 */

import { useState, useEffect } from "react";
import api from "../api";

function AddApparelProductForm({ onSuccess, onClose }) {
  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);

  // Product fields
  const [productName, setProductName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [material, setMaterial] = useState("");
  const [description, setDescription] = useState("");
  const [productImage, setProductImage] = useState(null);

  // Customs & Logistics
  const [itemId, setItemId] = useState("");
  const [hsCode, setHsCode] = useState("");
  const [countryOfOrigin, setCountryOfOrigin] = useState("");
  const [merchantProductId, setMerchantProductId] = useState("");
  const [manufacturerProductId, setManufacturerProductId] = useState("");
  const [standardisedProductId, setStandardisedProductId] = useState("");

  // Supplier
  const [supplierName, setSupplierName] = useState("");
  const [supplierEmail, setSupplierEmail] = useState("");
  const [supplierPhone, setSupplierPhone] = useState("");
  const [supplierAddress, setSupplierAddress] = useState("");

  // Internal
  const [notes, setNotes] = useState("");

  // Variants
  const [variants, setVariants] = useState([]);

  useEffect(() => {
    api.get("/api/apparel/categories/").then((res) => setCategories(res.data)).catch(console.error);
    api.get("/api/apparel/colors/").then((res) => setColors(res.data)).catch(console.error);
    api.get("/api/apparel/sizes/").then((res) => setSizes(res.data)).catch(console.error);
  }, []);

  const addVariantRow = () => {
    setVariants([...variants, { size_id: "", color_id: "", gender: "U", qty_stock: "" }]);
  };

  const updateVariant = (index, field, value) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const filledVariants = variants.filter(
      (v) => v.size_id && v.color_id && v.qty_stock !== ""
    );

    const seen = new Set();
    for (const v of filledVariants) {
      const key = `${v.size_id}-${v.color_id}-${v.gender}`;
      if (seen.has(key)) {
        alert("Duplicate variant detected: same size, colour and gender cannot be added twice.");
        return;
      }
      seen.add(key);
    }

    const formData = new FormData();
    formData.append("product_name", productName);
    formData.append("category_id", categoryId);
    formData.append("unit_price", unitPrice);
    formData.append("material", material);
    formData.append("description", description);
    formData.append("item_id", itemId);
    formData.append("hs_code", hsCode);
    formData.append("country_of_origin", countryOfOrigin);
    formData.append("merchant_product_id", merchantProductId);
    formData.append("manufacturer_product_id", manufacturerProductId);
    formData.append("standardised_product_id", standardisedProductId);
    formData.append("supplier_name", supplierName);
    formData.append("supplier_email", supplierEmail);
    formData.append("supplier_phone", supplierPhone);
    formData.append("supplier_address", supplierAddress);
    formData.append("notes", notes);
    if (productImage) formData.append("product_image", productImage);

    try {
      const productRes = await api.post("/api/apparel/products/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (productRes.status !== 201) {
        alert("Failed to create product.");
        return;
      }

      const productId = productRes.data.id;

      for (const v of filledVariants) {
        await api.post("/api/apparel/variants/", {
          product_id: productId,
          size_id: parseInt(v.size_id),
          color_id: parseInt(v.color_id),
          gender: v.gender,
          qty_stock: parseInt(v.qty_stock),
        });
      }

      onSuccess();
    } catch (err) {
      console.error("Error creating product:", err);
      console.error("Backend validation error:", JSON.stringify(err.response?.data));
      alert("Failed to create product. Check console for details.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full my-8">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-wa-navy">Add New Apparel Product</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Product Information */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-wa-navy mb-4 border-b pb-2">
                Product Information
              </h3>
            </div>

            <div>
              <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                id="productName"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="form_input"
                placeholder="e.g., 361° Staff Polo Green"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
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
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="unitPrice" className="block text-sm font-medium text-gray-700 mb-2">
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
                placeholder="e.g., 25.00"
              />
            </div>

            <div>
              <label htmlFor="material" className="block text-sm font-medium text-gray-700 mb-2">
                Material
              </label>
              <input
                type="text"
                id="material"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="form_input"
                placeholder="e.g., 100% Polyester"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form_input min-h-24"
                placeholder="Enter detailed product description..."
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="productImage" className="block text-sm font-medium text-gray-700 mb-2">
                Product Image
              </label>
              <input
                type="file"
                id="productImage"
                accept="image/*"
                onChange={(e) => setProductImage(e.target.files[0])}
                className="w-full px-4 py-2 border border-gray-300 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-wa-cyan focus:border-wa-cyan transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-wa-blue file:text-white hover:file:bg-wa-ocean"
              />
              <p className="text-sm text-gray-500 mt-1">Accepted formats: JPG, PNG, GIF (Max 5MB)</p>
            </div>

            {/* Customs & Logistics */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-lg font-semibold text-wa-navy mb-4 border-b pb-2">
                Customs & Logistics
              </h3>
            </div>

            <div>
              <label htmlFor="hsCode" className="block text-sm font-medium text-gray-700 mb-2">
                HS Code
              </label>
              <input
                type="text"
                id="hsCode"
                value={hsCode}
                onChange={(e) => setHsCode(e.target.value)}
                className="form_input"
                placeholder="e.g., 6109.10.00"
              />
            </div>

            <div>
              <label htmlFor="countryOfOrigin" className="block text-sm font-medium text-gray-700 mb-2">
                Country of Origin
              </label>
              <input
                type="text"
                id="countryOfOrigin"
                value={countryOfOrigin}
                onChange={(e) => setCountryOfOrigin(e.target.value)}
                className="form_input"
                placeholder="e.g., China, Vietnam"
              />
            </div>

            <div>
              <label htmlFor="itemId" className="block text-sm font-medium text-gray-700 mb-2">
                Item ID (361° Code)
              </label>
              <input
                type="text"
                id="itemId"
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
                className="form_input"
                placeholder="e.g., ZW1050601-2"
              />
            </div>

            <div>
              <label htmlFor="merchantProductId" className="block text-sm font-medium text-gray-700 mb-2">
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
              <label htmlFor="manufacturerProductId" className="block text-sm font-medium text-gray-700 mb-2">
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

            <div>
              <label htmlFor="standardisedProductId" className="block text-sm font-medium text-gray-700 mb-2">
                Standardised Product ID
              </label>
              <input
                type="text"
                id="standardisedProductId"
                value={standardisedProductId}
                onChange={(e) => setStandardisedProductId(e.target.value)}
                className="form_input"
                placeholder="e.g., GTIN / EAN / ISBN"
              />
            </div>

            {/* Supplier Information */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-lg font-semibold text-wa-navy mb-4 border-b pb-2">
                Supplier Information
              </h3>
            </div>

            <div>
              <label htmlFor="supplierName" className="block text-sm font-medium text-gray-700 mb-2">
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
              <label htmlFor="supplierEmail" className="block text-sm font-medium text-gray-700 mb-2">
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

            <div className="md:col-span-2">
              <label htmlFor="supplierAddress" className="block text-sm font-medium text-gray-700 mb-2">
                Supplier Address
              </label>
              <textarea
                id="supplierAddress"
                value={supplierAddress}
                onChange={(e) => setSupplierAddress(e.target.value)}
                className="form_input min-h-20"
              />
            </div>

            {/* Internal Notes */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-lg font-semibold text-wa-navy mb-4 border-b pb-2">
                Internal Notes
              </h3>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="form_input min-h-20"
                placeholder="Enter any internal notes or special instructions..."
              />
            </div>

            {/* Variants */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-lg font-semibold text-wa-navy mb-4 border-b pb-2">
                Variants
              </h3>
            </div>

            <div className="md:col-span-2 space-y-3">
              {variants.map((variant, index) => (
                <div
                  key={index}
                  className="flex flex-wrap gap-2 items-center bg-gray-50 p-3 rounded-md border border-gray-200"
                >
                  <select
                    value={variant.size_id}
                    onChange={(e) => updateVariant(index, "size_id", e.target.value)}
                    className="form_input flex-1 min-w-28"
                  >
                    <option value="">Size</option>
                    {sizes.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.size_value} ({s.size_type})
                      </option>
                    ))}
                  </select>

                  <select
                    value={variant.color_id}
                    onChange={(e) => updateVariant(index, "color_id", e.target.value)}
                    className="form_input flex-1 min-w-28"
                  >
                    <option value="">Colour</option>
                    {colors.map((c) => (
                      <option key={c.id} value={c.id}>{c.color_name}</option>
                    ))}
                  </select>

                  <select
                    value={variant.gender}
                    onChange={(e) => updateVariant(index, "gender", e.target.value)}
                    className="form_input w-32"
                  >
                    <option value="U">Unisex</option>
                    <option value="M">Men</option>
                    <option value="W">Women</option>
                    <option value="Y">Youth</option>
                  </select>

                  <input
                    type="number"
                    min="0"
                    value={variant.qty_stock}
                    onChange={(e) => updateVariant(index, "qty_stock", e.target.value)}
                    className="form_input w-24"
                    placeholder="Qty"
                  />

                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="text-red-500 hover:text-red-700 text-lg px-2"
                    title="Remove variant"
                  >
                    🗑
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addVariantRow}
                className="text-wa-blue hover:text-wa-ocean font-medium text-sm"
              >
                + Add a variant
              </button>
            </div>

            {/* Action Buttons */}
            <div className="md:col-span-2 mt-6 flex gap-3">
              <button type="button" onClick={onClose} className="btn_cancel">
                Cancel
              </button>
              <button type="submit" className="btn_confirm">
                Create Product
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default AddApparelProductForm;
