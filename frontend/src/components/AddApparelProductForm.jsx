/**
 * Add Apparel Product Form Component
 *
 * Creates base apparel product (without size/color variants).
 * Variants are added separately after product creation.
 */

import { useState, useEffect } from "react";
import api from "../api";

function AddApparelProductForm({ onSuccess }) {
  // Form state
  const [categories, setCategories] = useState([]);
  const [productName, setProductName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [itemId, setItemId] = useState("");
  const [gender, setGender] = useState("U");
  const [material, setMaterial] = useState("");
  const [description, setDescription] = useState("");
  const [hsCode, setHsCode] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [countryOfOrigin, setCountryOfOrigin] = useState("");
  const [productImage, setProductImage] = useState(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    getCategories();
  }, []);

  const getCategories = () => {
    api
      .get("/api/apparel/categories/")
      .then((res) => setCategories(res.data))
      .catch((err) => {
        console.error("Failed to load categories:", err);
        alert("Failed to load categories");
      });
  };

  const createProduct = (e) => {
    e.preventDefault();

    // Create FormData to handle file upload
    const formData = new FormData();
    formData.append("product_name", productName);
    formData.append("category_id", categoryId);
    formData.append("item_id", itemId);
    formData.append("gender", gender);
    formData.append("material", material);
    formData.append("description", description);
    formData.append("hs_code", hsCode);
    formData.append("unit_price", unitPrice);
    formData.append("country_of_origin", countryOfOrigin);
    formData.append("notes", notes);

    // Add image if selected
    if (productImage) {
      formData.append("product_image", productImage);
    }

    api
      .post("/api/apparel/products/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        if (res.status === 201) {
          alert(
            "Product created! Now add size/color variants to this product.",
          );
          // Clear form
          setProductName("");
          setCategoryId("");
          setItemId("");
          setGender("U");
          setMaterial("");
          setDescription("");
          setHsCode("");
          setUnitPrice("");
          setCountryOfOrigin("");
          setProductImage(null);
          setNotes("");
          document.getElementById("productImage").value = "";
          onSuccess();
        } else {
          alert("Failed to create product.");
        }
      })
      .catch((err) => {
        console.error("Error creating product:", err);
        alert("Failed to create product. Check console for details.");
      });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-8">
      <h2 className="text-2xl font-bold text-wa-navy mb-4">
        Add New Apparel Product
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Note: After creating the product, you'll need to add size/color variants
        separately.
      </p>

      <form
        onSubmit={createProduct}
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
            placeholder="e.g., 361° Staff Polo Green"
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
            htmlFor="itemId"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
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
          <label
            htmlFor="gender"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Gender *
          </label>
          <select
            id="gender"
            required
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="form_input"
          >
            <option value="U">Unisex</option>
            <option value="M">Men</option>
            <option value="W">Women</option>
            <option value="Y">Youth</option>
          </select>
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
            placeholder="e.g., 25.00"
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
            placeholder="e.g., 100% Polyester"
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
            className="form_input"
            placeholder="Enter detailed product description..."
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
            className="form_input"
            placeholder="e.g., 6109.10.00"
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
            placeholder="e.g., China, Vietnam"
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
            className="form_input"
            placeholder="Enter any internal notes or special instructions..."
          />
        </div>

        {/* Submit Button */}
        <div className="md:col-span-2 mt-4">
          <button type="submit" className="btn_add">
            Create Product
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddApparelProductForm;
