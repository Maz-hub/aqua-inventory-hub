// ExecutiveDetailsModal shows the full product record for a single executive item in a modal overlay.
//
// Props:
//   item      - the executive item object to display; returns null immediately if not provided
//   onClose   - called when the user clicks Close or the X button
//   onSuccess - called after a successful edit or delete so the parent can refetch
//   isAdmin   - when true, shows supplier info, internal notes, and the Edit/Delete/Adjust buttons
//
// State:
//   showEditForm - when true, the modal swaps its content entirely for EditExecutiveForm
//
// Edit behaviour:
//   Setting showEditForm to true replaces the details view with EditExecutiveForm.
//   On success, the edit form calls onSuccess() and onClose() to close everything.
//   On cancel, it sets showEditForm back to false and returns to the details view.
//
// All sections in the details view (Customs, Supplier, Notes) are conditionally
// rendered and only appear when at least one field in that group has a value.
// Supplier information is additionally gated behind isAdmin.
//
// Unlike Gift, unit_price is optional here, so it shows the real price when set
// and "—" when not, instead of always assuming a value exists.

import { useState } from "react";
import EditExecutiveForm from "./EditExecutiveForm";
import DocumentsSection from "./DocumentsSection";
import { useUser } from "../context/UserContext";

function ExecutiveDetailsModal({ item, onClose, onSuccess, isAdmin = false }) {
    if (!item) return null;

    const { hasAccess } = useUser();
    const canManageDocuments = hasAccess("executive_access") || hasAccess("admin");
    const [showEditForm, setShowEditForm] = useState(false);

    // When editing, replace the entire modal content with the edit form.
    if (showEditForm) {
        return (
            <EditExecutiveForm
                item={item}
                onClose={() => setShowEditForm(false)}
                onSuccess={() => {
                    setShowEditForm(false);
                    onSuccess();
                    onClose();
                }}
            />
        );
    }

    return (
        <>
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-2xl font-bold text-wa-navy">
                                Product Details
                            </h2>
                            <button
                                onClick={onClose}
                                className="text-gray-500 hover:text-gray-700 text-2xl font-bold cursor-pointer"
                            >
                                ×
                            </button>
                        </div>

                        {/* Product Image */}
                        {item.product_image && (
                            <div className="mb-6">
                                <img
                                    src={item.product_image.replace(
                                        "http://localhost:8000",
                                        "",
                                    )}
                                    alt={item.item_name}
                                    className="w-full h-64 object-contain rounded-lg bg-white border border-gray-100 p-4"
                                />
                            </div>
                        )}

                        {/* Product Information */}
                        <div className="space-y-6">
                            {/* Basic Info */}
                            <div>
                                <h3 className="text-lead font-semibold text-wa-navy mb-3 border-b pb-2">
                                    Basic Information
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            Item Name
                                        </p>
                                        <p className="font-medium text-wa-navy">
                                            {item.item_name}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-600">
                                            Category
                                        </p>
                                        <p className="font-medium text-wa-navy">
                                            {item.category.name}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-600">
                                            Stock Quantity
                                        </p>
                                        <p className="font-medium text-wa-navy">
                                            {item.qty_stock} units
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-600">
                                            Unit Price
                                        </p>
                                        <p className="font-medium text-wa-navy">
                                            {item.unit_price ? `$ ${parseFloat(item.unit_price).toFixed(2)}` : "—"}
                                        </p>
                                    </div>
                                </div>

                                {item.description && (
                                    <div className="mt-4">
                                        <p className="text-sm text-gray-600">
                                            Description
                                        </p>
                                        <p className="text-wa-navy font-medium">
                                            {item.description}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Documents — PDF attachments; hidden entirely unless the user
                                has executive_access or admin (viewers never see this section) */}
                            {canManageDocuments && (
                                <div className="mt-6">
                                    <DocumentsSection
                                        contentType="executive"
                                        objectId={item.id}
                                        canManage={canManageDocuments}
                                    />
                                </div>
                            )}

                            {/* Customs & Logistics — only shown when at least one field has a value */}
                            {(item.hs_code || item.country_of_origin || item.merchant_product_id || item.manufacturer_product_id || item.standardised_product_id) && (
                                <div>
                                    <h3 className="text-lead font-semibold text-wa-navy mb-3 border-b pb-2">
                                        Customs & Logistics
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {item.hs_code && (
                                            <div>
                                                <p className="text-sm text-gray-600">
                                                    HS Code
                                                </p>
                                                <p className="font-medium text-wa-navy">
                                                    {item.hs_code}
                                                </p>
                                            </div>
                                        )}

                                        {item.country_of_origin && (
                                            <div>
                                                <p className="text-sm text-gray-600">
                                                    Country of Origin
                                                </p>
                                                <p className="font-medium text-wa-navy">
                                                    {item.country_of_origin}
                                                </p>
                                            </div>
                                        )}

                                        {item.merchant_product_id && (
                                            <div>
                                                <p className="text-sm text-gray-600">
                                                    Merchant Product ID
                                                </p>
                                                <p className="font-medium text-wa-navy">
                                                    {item.merchant_product_id}
                                                </p>
                                            </div>
                                        )}

                                        {item.manufacturer_product_id && (
                                            <div>
                                                <p className="text-sm text-gray-600">
                                                    Manufacturer Product ID
                                                </p>
                                                <p className="font-medium text-wa-navy">
                                                    {item.manufacturer_product_id}
                                                </p>
                                            </div>
                                        )}

                                        {item.standardised_product_id && (
                                            <div>
                                                <p className="text-sm text-gray-600">
                                                    Standardised Product ID
                                                </p>
                                                <p className="font-medium text-wa-navy">
                                                    {item.standardised_product_id}
                                                </p>
                                            </div>
                                        )}

                                    </div>
                                </div>
                            )}

                            {/* Supplier Information — admin only, shown when at least one field has a value */}
                            {isAdmin &&
                                (item.supplier_name ||
                                    item.supplier_email ||
                                    item.supplier_phone ||
                                    item.supplier_address) && (
                                    <div>
                                        <h3 className="text-lead font-semibold text-wa-navy mb-3 border-b pb-2">
                                            Supplier Information
                                        </h3>
                                        <div className="space-y-3">
                                            {item.supplier_name && (
                                                <div>
                                                    <p className="text-sm text-gray-600">
                                                        Supplier Name
                                                    </p>
                                                    <p className="font-medium text-wa-navy">
                                                        {item.supplier_name}
                                                    </p>
                                                </div>
                                            )}

                                            {item.supplier_email && (
                                                <div>
                                                    <p className="text-sm text-gray-600">
                                                        Email
                                                    </p>
                                                    <p className="font-medium text-wa-navy">
                                                        {item.supplier_email}
                                                    </p>
                                                </div>
                                            )}

                                            {item.supplier_phone && (
                                                <div>
                                                    <p className="text-sm text-gray-600">
                                                        Phone
                                                    </p>
                                                    <p className="font-medium text-wa-navy">
                                                        {item.supplier_phone}
                                                    </p>
                                                </div>
                                            )}

                                            {item.supplier_address && (
                                                <div>
                                                    <p className="text-sm text-gray-600">
                                                        Address
                                                    </p>
                                                    <p className="font-medium text-wa-navy">
                                                        {item.supplier_address}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                            {/* Internal Notes */}
                            {item.notes && (
                                <div>
                                    <h3 className="text-lead font-semibold text-wa-navy mb-3 border-b pb-2">
                                        Internal Notes
                                    </h3>
                                    <p className="text-wa-navy font-medium">
                                        {item.notes}
                                    </p>
                                </div>
                            )}

                        </div>

                        {/* Action Buttons — Edit Product is admin-only */}
                        <div className="mt-6 flex gap-3">
                            <button onClick={onClose} className="btn_cancel">
                                Close
                            </button>
                            {isAdmin && (
                                <button onClick={() => setShowEditForm(true)} className="btn_confirm">
                                    Edit Product
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

        </>
    );
}

export default ExecutiveDetailsModal;
