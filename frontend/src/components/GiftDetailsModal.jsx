// GiftDetailsModal shows the full product record for a single gift in a modal overlay.
//
// Props:
//   gift      - the gift object to display; returns null immediately if not provided
//   onClose   - called when the user clicks Close or the X button
//   onSuccess - called after a successful edit or delete so the parent can refetch
//   isAdmin   - when true, shows supplier info, internal notes, and the Edit/Delete/Adjust buttons
//
// State:
//   showEditForm   - when true, the modal swaps its content entirely for EditGiftForm
//   showStockModal - when true, StockAdjustmentModal is rendered on top of this modal
//
// Edit behaviour:
//   Setting showEditForm to true replaces the details view with EditGiftForm.
//   On success, the edit form calls onSuccess() and onClose() to close everything.
//   On cancel, it sets showEditForm back to false and returns to the details view.
//
// Delete behaviour:
//   handleDelete prompts for confirmation, then calls the DELETE endpoint.
//   On success it calls onSuccess() to trigger a refetch in the parent, then onClose().
//
// Stock adjustment:
//   The Adjust Stock button opens StockAdjustmentModal as a second overlay.
//   On success it closes both the stock modal and this details modal.
//
// All sections in the details view (Customs, Supplier, Notes) are conditionally
// rendered and only appear when at least one field in that group has a value.
// Supplier information is additionally gated behind isAdmin.

import { useState } from "react";
import EditGiftForm from "./EditGiftForm";

function GiftDetailsModal({ gift, onClose, onSuccess, isAdmin = false }) {
    if (!gift) return null;

    const [showEditForm, setShowEditForm] = useState(false);

    // When editing, replace the entire modal content with the edit form.
    if (showEditForm) {
        return (
            <EditGiftForm
                gift={gift}
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
                        {gift.product_image && (
                            <div className="mb-6">
                                <img
                                    src={gift.product_image.replace(
                                        "http://localhost:8000",
                                        "",
                                    )}
                                    alt={gift.product_name}
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
                                            Product Name
                                        </p>
                                        <p className="font-medium text-wa-navy">
                                            {gift.product_name}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-600">
                                            Category
                                        </p>
                                        <p className="font-medium text-wa-navy">
                                            {gift.category.name}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-600">
                                            Stock Quantity
                                        </p>
                                        <p className="font-medium text-wa-navy">
                                            {gift.qty_stock} units
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-600">
                                            Unit Price
                                        </p>
                                        <p className="font-medium text-wa-navy">
                                            ${gift.unit_price}
                                        </p>
                                    </div>

                                    {gift.material && (
                                        <div>
                                            <p className="text-sm text-gray-600">
                                                Material
                                            </p>
                                            <p className="font-medium text-wa-navy">
                                                {gift.material}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {gift.description && (
                                    <div className="mt-4">
                                        <p className="text-sm text-gray-600">
                                            Description
                                        </p>
                                        <p className="text-wa-navy font-medium">
                                            {gift.description}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Customs & Logistics — only shown when at least one field has a value */}
                            {(gift.hs_code || gift.country_of_origin || gift.merchant_product_id || gift.manufacturer_product_id || gift.standardised_product_id) && (
                                <div>
                                    <h3 className="text-lead font-semibold text-wa-navy mb-3 border-b pb-2">
                                        Customs & Logistics
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {gift.hs_code && (
                                            <div>
                                                <p className="text-sm text-gray-600">
                                                    HS Code
                                                </p>
                                                <p className="font-medium text-wa-navy">
                                                    {gift.hs_code}
                                                </p>
                                            </div>
                                        )}

                                        {gift.country_of_origin && (
                                            <div>
                                                <p className="text-sm text-gray-600">
                                                    Country of Origin
                                                </p>
                                                <p className="font-medium text-wa-navy">
                                                    {gift.country_of_origin}
                                                </p>
                                            </div>
                                        )}

                                        {gift.merchant_product_id && (
                                            <div>
                                                <p className="text-sm text-gray-600">
                                                    Merchant Product ID
                                                </p>
                                                <p className="font-medium text-wa-navy">
                                                    {gift.merchant_product_id}
                                                </p>
                                            </div>
                                        )}

                                        {gift.manufacturer_product_id && (
                                            <div>
                                                <p className="text-sm text-gray-600">
                                                    Manufacturer Product ID
                                                </p>
                                                <p className="font-medium text-wa-navy">
                                                    {gift.manufacturer_product_id}
                                                </p>
                                            </div>
                                        )}

                                        {gift.standardised_product_id && (
                                            <div>
                                                <p className="text-sm text-gray-600">
                                                    Standardised Product ID
                                                </p>
                                                <p className="font-medium text-wa-navy">
                                                    {gift.standardised_product_id}
                                                </p>
                                            </div>
                                        )}

                                    </div>
                                </div>
                            )}

                            {/* Supplier Information — admin only, shown when at least one field has a value */}
                            {isAdmin &&
                                (gift.supplier_name ||
                                    gift.supplier_email ||
                                    gift.supplier_phone ||
                                    gift.supplier_address) && (
                                    <div>
                                        <h3 className="text-lead font-semibold text-wa-navy mb-3 border-b pb-2">
                                            Supplier Information
                                        </h3>
                                        <div className="space-y-3">
                                            {gift.supplier_name && (
                                                <div>
                                                    <p className="text-sm text-gray-600">
                                                        Supplier Name
                                                    </p>
                                                    <p className="font-medium text-wa-navy">
                                                        {gift.supplier_name}
                                                    </p>
                                                </div>
                                            )}

                                            {gift.supplier_email && (
                                                <div>
                                                    <p className="text-sm text-gray-600">
                                                        Email
                                                    </p>
                                                    <p className="font-medium text-wa-navy">
                                                        {gift.supplier_email}
                                                    </p>
                                                </div>
                                            )}

                                            {gift.supplier_phone && (
                                                <div>
                                                    <p className="text-sm text-gray-600">
                                                        Phone
                                                    </p>
                                                    <p className="font-medium text-wa-navy">
                                                        {gift.supplier_phone}
                                                    </p>
                                                </div>
                                            )}

                                            {gift.supplier_address && (
                                                <div>
                                                    <p className="text-sm text-gray-600">
                                                        Address
                                                    </p>
                                                    <p className="font-medium text-wa-navy">
                                                        {gift.supplier_address}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                            {/* Internal Notes */}
                            {gift.notes && (
                                <div>
                                    <h3 className="text-lead font-semibold text-wa-navy mb-3 border-b pb-2">
                                        Internal Notes
                                    </h3>
                                    <p className="text-wa-navy font-medium">
                                        {gift.notes}
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

export default GiftDetailsModal;
