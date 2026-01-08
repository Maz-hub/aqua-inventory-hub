/**
 * Gift Details Modal Component
 *
 * Displays full product information in a modal overlay.
 * Shows all fields from the Gift model including customs and supplier data.
 */

function GiftDetailsModal({ gift, onClose }) {
  if (!gift) return null;

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
          {gift.product_image && (
            <div className="mb-6">
              <img
                src={gift.product_image.replace("http://localhost:8000", "")}
                alt={gift.product_name}
                className="w-full h-64 object-cover rounded-lg"
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
                  <p className="text-sm text-gray-600">Product Name</p>
                  <p className="font-medium text-wa-navy">
                    {gift.product_name}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="font-medium text-wa-navy">
                    {gift.category.name}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Stock Quantity</p>
                  <p className="font-medium text-wa-navy">
                    {gift.qty_stock} units
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Unit Price</p>
                  <p className="font-medium text-wa-navy">${gift.unit_price}</p>
                </div>

                {gift.material && (
                  <div>
                    <p className="text-sm text-gray-600">Material</p>
                    <p className="font-medium text-wa-navy">{gift.material}</p>
                  </div>
                )}
              </div>

              {gift.description && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="text-wa-navy font-medium">{gift.description}</p>
                </div>
              )}
            </div>

            {/* Customs & Logistics */}
            {(gift.hs_code || gift.country_of_origin) && (
              <div>
                <h3 className="text-lead font-semibold text-wa-navy mb-3 border-b pb-2">
                  Customs & Logistics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {gift.hs_code && (
                    <div>
                      <p className="text-sm text-gray-600">HS Code</p>
                      <p className="font-medium text-wa-navy">{gift.hs_code}</p>
                    </div>
                  )}

                  {gift.country_of_origin && (
                    <div>
                      <p className="text-sm text-gray-600">Country of Origin</p>
                      <p className="font-medium text-wa-navy">
                        {gift.country_of_origin}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Supplier Information */}
            {(gift.supplier_name ||
              gift.supplier_email ||
              gift.supplier_address) && (
              <div>
                <h3 className="text-lead font-semibold text-wa-navy mb-3 border-b pb-2">
                  Supplier Information
                </h3>
                <div className="space-y-3">
                  {gift.supplier_name && (
                    <div>
                      <p className="text-sm text-gray-600">Supplier Name</p>
                      <p className="font-medium text-wa-navy">
                        {gift.supplier_name}
                      </p>
                    </div>
                  )}

                  {gift.supplier_email && (
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-wa-navy">
                        {gift.supplier_email}
                      </p>
                    </div>
                  )}

                  {gift.supplier_address && (
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
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
                <p className="text-wa-navy font-medium">{gift.notes}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-md hover:bg-gray-300 cursor-pointer transition-all font-medium"
            >
              Close
            </button>
            <button className="flex-1 bg-wa-blue text-white py-2 rounded-md hover:bg-wa-ocean cursor-pointer transition-all font-medium">
              Edit Product
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GiftDetailsModal;
