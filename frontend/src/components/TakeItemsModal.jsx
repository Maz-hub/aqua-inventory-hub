/**
 * Take Items Modal Component
 * 
 * Allows users to deduct items from inventory with reason tracking.
 * Records who took items, when, how many, and why.
 */

import { useState } from "react";

function TakeItemsModal({ gift, onClose, onSuccess }) {
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!quantity || quantity <= 0) {
      alert("Please enter a valid quantity");
      return;
    }
    
    if (quantity > gift.qty_stock) {
      alert(`Cannot take ${quantity} items. Only ${gift.qty_stock} in stock.`);
      return;
    }
    
    if (!reason) {
      alert("Please select a reason");
      return;
    }

    // TODO: Send to backend API
    console.log({
      gift_id: gift.id,
      quantity: parseInt(quantity),
      reason: reason,
      notes: notes,
      action: "take"
    });

    alert(`Successfully recorded: ${quantity} items taken`);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-wa-navy">Take Items</h2>
              <p className="text-sm text-gray-600 mt-1">{gift.product_name}</p>
              <p className="text-sm text-gray-600">Available: {gift.qty_stock} units</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Quantity */}
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                How many are you taking? *
              </label>
              <input
                type="number"
                id="quantity"
                min="1"
                max={gift.qty_stock}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wa-cyan focus:border-wa-cyan transition-colors"
                placeholder="Enter quantity"
                required
              />
            </div>

            {/* Reason */}
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Reason *
              </label>
              <select
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-wa-cyan focus:border-wa-cyan transition-colors"
                required
              >
                <option value="">Select a reason</option>
                <option value="event">Event</option>
                <option value="office_use">Office Use</option>
                <option value="donation">Donation</option>
                <option value="damaged">Damaged/Defective</option>
                <option value="sample">Sample</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md min-h-[80px] resize-y focus:outline-none focus:ring-2 focus:ring-wa-cyan focus:border-wa-cyan transition-colors"
                placeholder="Additional details..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-md hover:bg-gray-300 cursor-pointer transition-all font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-wa-ocean text-white py-2 rounded-md hover:bg-wa-blue cursor-pointer transition-all font-medium"
              >
                Confirm
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TakeItemsModal;