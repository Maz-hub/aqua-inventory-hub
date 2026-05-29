import { useState, useEffect, useRef } from "react";
import api from "../api";

function EditApparelProductForm({ product, onSuccess, onClose }) {
  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);

  // Product fields — pre-populated from product prop
  const [productName, setProductName] = useState(product.product_name);
  const [categoryId, setCategoryId] = useState(product.category.id);
  const [primaryColorId, setPrimaryColorId] = useState(product.primary_color?.id || "");
  const [unitPrice, setUnitPrice] = useState(product.unit_price);
  const [material, setMaterial] = useState(product.material || "");
  const [description, setDescription] = useState(product.description || "");
  const [productImage, setProductImage] = useState(null);

  // Customs & Logistics
  const [itemId, setItemId] = useState(product.item_id || "");
  const [hsCode, setHsCode] = useState(product.hs_code || "");
  const [countryOfOrigin, setCountryOfOrigin] = useState(product.country_of_origin || "");
  const [merchantProductId, setMerchantProductId] = useState(product.merchant_product_id || "");
  const [manufacturerProductId, setManufacturerProductId] = useState(product.manufacturer_product_id || "");
  const [standardisedProductId, setStandardisedProductId] = useState(product.standardised_product_id || "");

  // Supplier
  const [supplierName, setSupplierName] = useState(product.supplier_name || "");
  const [supplierEmail, setSupplierEmail] = useState(product.supplier_email || "");
  const [supplierPhone, setSupplierPhone] = useState(product.supplier_phone || "");
  const [supplierAddress, setSupplierAddress] = useState(product.supplier_address || "");

  // Internal
  const [notes, setNotes] = useState(product.notes || "");

  // Variants
  const [existingVariants, setExistingVariants] = useState(product.variants || []);
  const [newVariants, setNewVariants] = useState([]);
  const [variantErrors, setVariantErrors] = useState([]);
  const variantRowRefs = useRef([]);

  useEffect(() => {
    api.get("/api/apparel/categories/").then((res) => setCategories(res.data)).catch(console.error);
    api.get("/api/apparel/colors/").then((res) => setColors(res.data)).catch(console.error);
    api.get("/api/apparel/sizes/").then((res) => setSizes(res.data)).catch(console.error);
  }, []);

  const deleteExistingVariant = async (variantId) => {
    if (!window.confirm("Delete this variant? This cannot be undone.")) return;
    try {
      await api.delete(`/api/apparel/variants/${variantId}/`);
      setExistingVariants(existingVariants.filter((v) => v.id !== variantId));
    } catch (err) {
      console.error("Failed to delete variant:", err);
      alert("Failed to delete variant.");
    }
  };

  const addNewVariantRow = () => {
    setNewVariants([...newVariants, { size_id: "", gender: "U", qty_stock: "" }]);
    setVariantErrors([...variantErrors, { size_id: false, qty_stock: false }]);
  };

  const updateNewVariant = (index, field, value) => {
    const updated = [...newVariants];
    updated[index] = { ...updated[index], [field]: value };
    setNewVariants(updated);

    if (value !== "" && variantErrors[index]?.[field]) {
      const updatedErrors = [...variantErrors];
      updatedErrors[index] = { ...updatedErrors[index], [field]: false };
      setVariantErrors(updatedErrors);
    }
  };

  const removeNewVariant = (index) => {
    setNewVariants(newVariants.filter((_, i) => i !== index));
    setVariantErrors(variantErrors.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate new variant rows
    const newErrors = newVariants.map((v) => ({
      size_id: !v.size_id,
      qty_stock: v.qty_stock === "",
    }));
    const hasIncomplete = newErrors.some((e) => e.size_id || e.qty_stock);
    if (hasIncomplete) {
      setVariantErrors(newErrors);
      const firstErrorIndex = newErrors.findIndex((e) => e.size_id || e.color_id || e.qty_stock);
      variantRowRefs.current[firstErrorIndex]?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const filledNewVariants = newVariants.filter(
      (v) => v.size_id && v.qty_stock !== ""
    );

    // Duplicate check: seed with remaining existing variants, then check new ones
    const seen = new Set();
    for (const ev of existingVariants) {
      seen.add(`${ev.size.id}-${ev.gender}`);
    }
    for (const v of filledNewVariants) {
      const key = `${v.size_id}-${v.gender}`;
      if (seen.has(key)) {
        alert("Duplicate variant detected: same size, colour and gender already exists.");
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
    if (primaryColorId) formData.append("primary_color_id", primaryColorId);
    if (productImage) formData.append("product_image", productImage);

    try {
      const res = await api.patch(`/api/apparel/products/${product.id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.status !== 200) {
        alert("Failed to update product.");
        return;
      }

      for (const v of filledNewVariants) {
        await api.post("/api/apparel/variants/", {
          product_id: product.id,
          size_id: parseInt(v.size_id),
          color_id: parseInt(primaryColorId),
          gender: v.gender,
          qty_stock: parseInt(v.qty_stock),
        });
      }

      onSuccess();
    } catch (err) {
      console.error("Error updating product:", err);
      console.error("Backend validation error:", JSON.stringify(err.response?.data));
      alert("Failed to update product. Check console for details.");
    }
  };

  const genderLabel = { U: "Unisex", M: "Men", W: "Women", Y: "Youth" };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full my-8">
        <div className="p-6">

          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-wa-navy">Edit Product</h2>
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
              <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 mb-2">
                Primary Colour *
              </label>
              <select
                id="primaryColor"
                required
                value={primaryColorId}
                onChange={(e) => setPrimaryColorId(e.target.value)}
                className="form_input"
              >
                <option value="">Select a colour</option>
                {colors.map((color) => (
                  <option key={color.id} value={color.id}>{color.color_name}</option>
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
              />
            </div>

            {product.product_image && (
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-700 mb-2">Current Image:</p>
                <img
                  src={product.product_image.replace("http://localhost:8000", "")}
                  alt={product.product_name}
                  className="h-32 object-contain rounded border"
                />
              </div>
            )}

            <div className="md:col-span-2">
              <label htmlFor="productImage" className="block text-sm font-medium text-gray-700 mb-2">
                Update Product Image (optional)
              </label>
              <input
                type="file"
                id="productImage"
                accept="image/*"
                onChange={(e) => setProductImage(e.target.files[0])}
                className="w-full px-4 py-2 border border-gray-300 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-wa-cyan focus:border-wa-cyan transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-wa-blue file:text-white hover:file:bg-wa-ocean"
              />
            </div>

            {/* Variants */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-lg font-semibold text-wa-navy mb-1 border-b pb-2">
                Variants
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                One product = one colour. Only add variants of the same colour as the existing ones.
              </p>
            </div>

            <div className="md:col-span-2 space-y-3">
              {existingVariants.map((variant) => (
                <div
                  key={variant.id}
                  className="flex flex-wrap gap-2 items-center bg-gray-50 p-3 rounded-md border border-gray-200"
                >
                  <span className="form_input flex-1 min-w-28 bg-gray-100 text-gray-700 cursor-default select-none">
                    {variant.size.size_value} ({variant.size.size_type})
                  </span>
                  <span className="form_input w-32 bg-gray-100 text-gray-700 cursor-default select-none">
                    {genderLabel[variant.gender] || variant.gender}
                  </span>
                  <span className="form_input w-24 bg-gray-100 text-gray-700 cursor-default select-none">
                    {variant.qty_stock}
                  </span>
                  <button
                    type="button"
                    onClick={() => deleteExistingVariant(variant.id)}
                    className="text-red-500 hover:text-red-700 text-lg px-2 cursor-pointer"
                    title="Delete variant"
                  >
                    🗑
                  </button>
                </div>
              ))}

              {newVariants.map((variant, index) => (
                <div
                  key={`new-${index}`}
                  ref={(el) => (variantRowRefs.current[index] = el)}
                  className="flex flex-wrap gap-2 items-center bg-blue-50 p-3 rounded-md border border-blue-200"
                >
                  <select
                    value={variant.size_id}
                    onChange={(e) => updateNewVariant(index, "size_id", e.target.value)}
                    className={`form_input flex-1 min-w-28 ${variantErrors[index]?.size_id ? "border-red-500" : ""}`}
                  >
                    <option value="">Size</option>
                    {sizes.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.size_value} ({s.size_type})
                      </option>
                    ))}
                  </select>

                  <select
                    value={variant.gender}
                    onChange={(e) => updateNewVariant(index, "gender", e.target.value)}
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
                    onChange={(e) => updateNewVariant(index, "qty_stock", e.target.value)}
                    className={`form_input w-24 ${variantErrors[index]?.qty_stock ? "border-red-500" : ""}`}
                    placeholder="Qty"
                  />

                  <button
                    type="button"
                    onClick={() => removeNewVariant(index)}
                    className="text-red-500 hover:text-red-700 text-lg px-2 cursor-pointer"
                    title="Remove variant"
                  >
                    🗑
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addNewVariantRow}
                className="text-wa-blue hover:text-wa-ocean font-medium text-sm cursor-pointer"
              >
                + Add new variant
              </button>

              {variantErrors.some((e) => e.size_id || e.qty_stock) && (
                <p className="text-red-500 text-sm mt-1">Please complete all highlighted fields.</p>
              )}
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
                <span className="text-gray-400 font-normal"> (GTIN, EAN, ISBN — enter NO if not applicable)</span>
              </label>
              <input
                type="text"
                id="standardisedProductId"
                value={standardisedProductId}
                onChange={(e) => setStandardisedProductId(e.target.value)}
                className="form_input"
                placeholder="e.g. GTIN 00000006 or NO"
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
              />
            </div>

            {/* Action Buttons */}
            <div className="md:col-span-2 mt-6 flex gap-3">
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

export default EditApparelProductForm;
