/**
 * Apparel Details Modal Component
 *
 * Displays full product information with all size/color variants.
 * Shows product details, customs info, and variant stock levels.
 */

import { useState } from "react";
import EditApparelProductForm from "./EditApparelProductForm";

function ApparelDetailsModal({ product, onClose, onSuccess }) {
  if (!product) return null;

  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <EditApparelProductForm
            product={product}
            onSuccess={() => {
              setIsEditing(false);
              onSuccess();
              onClose();
            }}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-wa-navy">Product Details</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
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
                className="w-full h-64 object-contain rounded-lg bg-gray-100"
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
                  <p className="text-sm text-gray-600">Gender</p>
                  <p className="font-medium text-wa-navy">
                    {product.gender === "M"
                      ? "Men"
                      : product.gender === "W"
                        ? "Women"
                        : product.gender === "U"
                          ? "Unisex"
                          : "Youth"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Unit Price</p>
                  <p className="font-medium text-wa-navy">
                    ${product.unit_price}
                  </p>
                </div>

                {product.item_id && (
                  <div>
                    <p className="text-sm text-gray-600">Item ID (361°)</p>
                    <p className="font-medium text-wa-navy">
                      {product.item_id}
                    </p>
                  </div>
                )}

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

            {/* Variants / Stock Levels */}
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
                            {variant.size.size_value}
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

            {/* Customs & Logistics */}
            {(product.hs_code || product.country_of_origin) && (
              <div>
                <h3 className="text-lg font-semibold text-wa-navy mb-3 border-b pb-2">
                  Customs & Logistics
                </h3>
                <div className="grid grid-cols-2 gap-4">
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
                </div>
              </div>
            )}

            {/* Internal Notes */}
            {product.notes && (
              <div>
                <h3 className="text-lg font-semibold text-wa-navy mb-3 border-b pb-2">
                  Internal Notes
                </h3>
                <p className="text-wa-navy font-medium">{product.notes}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3">
            <button onClick={onClose} className="btn_cancel">
              Close
            </button>
            <button onClick={() => setIsEditing(true)} className="btn_main">
              Edit Product
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApparelDetailsModal;
