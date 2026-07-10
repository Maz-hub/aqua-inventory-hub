// ApparelDetailsModal shows the full product record for a single apparel product,
// including all size/colour/gender variants with their current stock counts.
//
// Props:
//   product   - the product object to display (including nested variants array);
//               returns null immediately if not provided
//   onClose   - called when the user dismisses the modal
//   onSuccess - called after a successful edit so the parent can refetch
//   isAdmin   - when true, shows supplier info, internal notes, and the Edit Product button
//
// State:
//   isEditing - when true, swaps the entire modal content for EditApparelProductForm
//
// Edit behaviour:
//   Setting isEditing to true replaces the details view with EditApparelProductForm.
//   On success, it calls onSuccess() and onClose() to close everything.
//   On cancel, it sets isEditing back to false and returns to the details view.
//
// Unlike GiftDetailsModal, there is no Delete button here.
// Product deletion is handled directly in AdminApparel via the table row button.
//
// Variant display:
//   Each variant card shows colour, size, gender, and current stock.
//   Cards with stock at or below minimum_stock_level get a red border and LOW badge.
//   GENDER_LABELS maps the single-character code to a readable label.
//
// All optional sections (Customs, Supplier, Notes) are conditionally rendered and
// only appear when at least one field in that group has a value.
// Supplier information and Notes are additionally gated behind isAdmin.

import { useState } from "react";
import EditApparelProductForm from "./EditApparelProductForm";
import DocumentsSection from "./DocumentsSection";
import { useUser } from "../context/UserContext";

const GENDER_LABELS = { M: 'Men', W: 'Women', U: 'Unisex', Y: 'Youth' };

function ApparelDetailsModal({ product, onClose, onSuccess, isAdmin = false }) {
  const [isEditing, setIsEditing] = useState(false);
  const { hasAccess } = useUser();
  const canManageDocuments = hasAccess("apparel_access") || hasAccess("admin");

  if (!product) return null;

  // When editing, replace the entire modal content with the edit form.
  if (isEditing) {
    return (
      <EditApparelProductForm
        product={product}
        onClose={() => setIsEditing(false)}
        onSuccess={() => {
          setIsEditing(false);
          onSuccess();
          onClose();
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-wa-navy">Product Details</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold cursor-pointer"
            >
              ×
            </button>
          </div>

          {/* Product Image */}
          {product.product_image && (
            <div className="mb-6">
              <img
                src={product.product_image.replace("http://localhost:8000", "")}
                alt={product.product_name}
                className="w-full h-64 object-contain rounded-lg bg-white border border-gray-100 p-4"
              />
            </div>
          )}

          {/* Product Information */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-semibold text-wa-navy mb-3 border-b pb-2">
                Basic Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Product Name</p>
                  <p className="font-medium text-wa-navy">
                    {product.product_name}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="font-medium text-wa-navy">
                    {product.category.name}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Unit Price</p>
                  <p className="font-medium text-wa-navy">
                    ${product.unit_price}
                  </p>
                </div>

                {product.material && (
                  <div>
                    <p className="text-sm text-gray-600">Material</p>
                    <p className="font-medium text-wa-navy">
                      {product.material}
                    </p>
                  </div>
                )}
              </div>

              {product.description && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="text-wa-navy font-medium">
                    {product.description}
                  </p>
                </div>
              )}
            </div>

            {/* Documents — PDF attachments; hidden entirely unless the user has
                apparel_access or admin (viewers never see this section) */}
            {canManageDocuments && (
              <div className="mt-6">
                <DocumentsSection
                  contentType="apparel"
                  objectId={product.id}
                  canManage={canManageDocuments}
                />
              </div>
            )}

            {/* Variants / Stock Levels — each card is highlighted red when at or below minimum */}
            <div>
              <h3 className="text-lg font-semibold text-wa-navy mb-3 border-b pb-2">
                Size/Color Variants & Stock
              </h3>
              {product.variants && product.variants.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {product.variants.map((variant) => (
                    <div
                      key={variant.id}
                      className={`p-3 rounded border-2 ${
                        variant.qty_stock <= variant.minimum_stock_level
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-wa-navy">
                            {variant.color.color_name} -{" "}
                            {variant.size.size_value} -{" "}
                            {GENDER_LABELS[variant.gender] ?? variant.gender}
                          </p>
                          <p className="text-sm text-gray-600">
                            Stock: <strong>{variant.qty_stock}</strong>
                          </p>
                          {variant.sku && (
                            <p className="text-xs text-gray-500 mt-1">
                              SKU: {variant.sku}
                            </p>
                          )}
                        </div>
                        {variant.qty_stock <= variant.minimum_stock_level && (
                          <span className="badge_low">LOW</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No variants added yet</p>
              )}
            </div>

            {/* Customs & Logistics — only shown when at least one field has a value */}
            {(product.item_id ||
              product.hs_code ||
              product.country_of_origin ||
              product.merchant_product_id ||
              product.manufacturer_product_id ||
              product.standardised_product_id) && (
              <div>
                <h3 className="text-lg font-semibold text-wa-navy mb-3 border-b pb-2">
                  Customs & Logistics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {product.item_id && (
                    <div>
                      <p className="text-sm text-gray-600">Item ID (361°)</p>
                      <p className="font-medium text-wa-navy">
                        {product.item_id}
                      </p>
                    </div>
                  )}

                  {product.hs_code && (
                    <div>
                      <p className="text-sm text-gray-600">HS Code</p>
                      <p className="font-medium text-wa-navy">
                        {product.hs_code}
                      </p>
                    </div>
                  )}

                  {product.country_of_origin && (
                    <div>
                      <p className="text-sm text-gray-600">Country of Origin</p>
                      <p className="font-medium text-wa-navy">
                        {product.country_of_origin}
                      </p>
                    </div>
                  )}

                  {product.merchant_product_id && (
                    <div>
                      <p className="text-sm text-gray-600">
                        Merchant Product ID
                      </p>
                      <p className="font-medium text-wa-navy">
                        {product.merchant_product_id}
                      </p>
                    </div>
                  )}

                  {product.manufacturer_product_id && (
                    <div>
                      <p className="text-sm text-gray-600">
                        Manufacturer Product ID
                      </p>
                      <p className="font-medium text-wa-navy">
                        {product.manufacturer_product_id}
                      </p>
                    </div>
                  )}

                  {product.standardised_product_id && (
                    <div>
                      <p className="text-sm text-gray-600">
                        Standardised Product ID
                      </p>
                      <p className="font-medium text-wa-navy">
                        {product.standardised_product_id}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Supplier Information — admin only, shown when at least one field has a value */}
            {isAdmin &&
              (product.supplier_name ||
                product.supplier_email ||
                product.supplier_phone ||
                product.supplier_address) && (
                <div>
                  <h3 className="text-lg font-semibold text-wa-navy mb-3 border-b pb-2">
                    Supplier Information
                  </h3>
                  <div className="space-y-3">
                    {product.supplier_name && (
                      <div>
                        <p className="text-sm text-gray-600">Supplier Name</p>
                        <p className="font-medium text-wa-navy">
                          {product.supplier_name}
                        </p>
                      </div>
                    )}

                    {product.supplier_email && (
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium text-wa-navy">
                          {product.supplier_email}
                        </p>
                      </div>
                    )}

                    {product.supplier_phone && (
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium text-wa-navy">
                          {product.supplier_phone}
                        </p>
                      </div>
                    )}

                    {product.supplier_address && (
                      <div>
                        <p className="text-sm text-gray-600">Address</p>
                        <p className="font-medium text-wa-navy">
                          {product.supplier_address}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

            {/* Internal Notes — admin only */}
            {isAdmin && product.notes && (
              <div>
                <h3 className="text-lg font-semibold text-wa-navy mb-3 border-b pb-2">
                  Internal Notes
                </h3>
                <p className="text-wa-navy font-medium">{product.notes}</p>
              </div>
            )}
          </div>

          {/* Action Buttons — Edit Product is admin-only */}
          <div className="mt-6 flex gap-3">
            <button onClick={onClose} className="btn_cancel">
              Close
            </button>
            {isAdmin && (
              <button onClick={() => setIsEditing(true)} className="btn_confirm">
                Edit Product
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApparelDetailsModal;
