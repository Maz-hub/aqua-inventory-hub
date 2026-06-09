// EditOfficeForm is the admin modal for editing an existing office item.
// Pre-fills all fields from the current item data.
//
// Props:
//   item      - the office item object to edit
//   onClose   - called when the user cancels or clicks the X button
//   onSuccess - called after a successful update so the parent can refetch

import { useState, useEffect } from "react";
import api from "../api";

function EditOfficeForm({ item, onClose, onSuccess }) {
    const [categories, setCategories] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [itemName, setItemName] = useState(item.item_name);
    const [categoryId, setCategoryId] = useState(item.category.id);
    const [unitPrice, setUnitPrice] = useState(item.unit_price || "");
    const [departmentId, setDepartmentId] = useState(item.department?.id || "");
    const [description, setDescription] = useState(item.description || "");
    const [hsCode, setHsCode] = useState(item.hs_code || "");
    const [countryOfOrigin, setCountryOfOrigin] = useState(item.country_of_origin || "");
    const [merchantProductId, setMerchantProductId] = useState(item.merchant_product_id || "");
    const [manufacturerProductId, setManufacturerProductId] = useState(item.manufacturer_product_id || "");
    const [standardisedProductId, setStandardisedProductId] = useState(item.standardised_product_id || "");
    const [supplierName, setSupplierName] = useState(item.supplier_name || "");
    const [supplierEmail, setSupplierEmail] = useState(item.supplier_email || "");
    const [supplierPhone, setSupplierPhone] = useState(item.supplier_phone || "");
    const [supplierAddress, setSupplierAddress] = useState(item.supplier_address || "");
    const [notes, setNotes] = useState(item.notes || "");
    const [productImage, setProductImage] = useState(null);

    useEffect(() => {
        api.get("/api/office/categories/")
            .then((res) => setCategories(res.data))
            .catch((err) => console.error("Failed to load categories:", err));
        api.get("/api/core/departments/")
            .then((res) => setDepartments(res.data))
            .catch((err) => console.error("Failed to load departments:", err));
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("item_name", itemName);
        formData.append("category_id", categoryId);
        formData.append("unit_price", unitPrice);
        // Send empty string to clear department, or the selected ID
        formData.append("department_id", departmentId || "");
        formData.append("description", description);
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

        api.patch(`/api/office/update/${item.id}/`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        })
            .then((res) => {
                if (res.status === 200) {
                    alert("Item updated successfully!");
                    onSuccess();
                    onClose();
                }
            })
            .catch((err) => {
                alert(err.response?.data?.error || "Failed to update item.");
            });
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-4xl w-full my-8">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-2xl font-bold text-wa-navy">Edit Item</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 text-2xl font-bold cursor-pointer"
                        >
                            ×
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Item Information */}
                        <div className="md:col-span-2">
                            <h3 className="text-lg font-semibold text-wa-navy mb-4 border-b pb-2">
                                Item Information
                            </h3>
                        </div>

                        {/* Image */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Image {item.product_image && "(Leave empty to keep current image)"}
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setProductImage(e.target.files[0])}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-wa-cyan focus:border-wa-cyan transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-wa-blue file:text-white hover:file:bg-wa-ocean"
                            />
                        </div>

                        {/* Item Name */}
                        <div>
                            <label htmlFor="itemName" className="block text-sm font-medium text-gray-700 mb-2">
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
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Unit Price */}
                        <div>
                            <label htmlFor="unitPrice" className="block text-sm font-medium text-gray-700 mb-2">
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

                        {/* Department */}
                        <div>
                            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                                Department
                            </label>
                            <select
                                id="department"
                                value={departmentId}
                                onChange={(e) => setDepartmentId(e.target.value)}
                                className="form_input"
                            >
                                <option value="">No department</option>
                                {departments.map((dept) => (
                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="form_input min-h-25"
                            />
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

export default EditOfficeForm;
