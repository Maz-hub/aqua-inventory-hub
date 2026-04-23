/**
 * SelectionDrawer Component
 *
 * Slide-out panel showing current item selection.
 * Opens from the right on desktop, bottom sheet on mobile.
 * Users can review, adjust quantities, remove items,
 * and proceed to submit their Item Request.
 */

import { useSelection } from "../context/SelectionContext";
import { useNavigate } from "react-router-dom";

function SelectionDrawer({ isOpen, onClose }) {
    const { items, removeItem, updateQuantity, totalItems, totalCost } = useSelection();
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleSubmitRequest = () => {
        onClose();
        navigate("/requests/new");
    };

    return (
        <>
            {/* Backdrop — clicking outside closes drawer */}
            <div
                className="fixed inset-0 bg-black bg-opacity-40 z-40"
                onClick={onClose}
            />

            {/* Drawer — right side on desktop, bottom on mobile */}
            <div className="fixed bottom-0 left-0 right-0 md:bottom-auto md:top-0 md:right-0 md:left-auto md:h-full md:w-96 bg-white z-50 shadow-2xl flex flex-col rounded-t-2xl md:rounded-none">

                {/* Header */}
                <div className="flex items-center justify-between px-4 py-4 border-b bg-wa-navy text-white md:rounded-none rounded-t-2xl">
                    <h2 className="text-lg font-bold">
                        My Selection
                        {totalItems > 0 && (
                            <span className="ml-2 text-sm font-normal text-wa-cyan">
                                {totalItems} item{totalItems !== 1 ? "s" : ""}
                            </span>
                        )}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-wa-blue transition-colors cursor-pointer"
                        title="Close"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto px-4 py-4 max-h-64 md:max-h-full">
                    {items.length === 0 ? (
                        <div className="text-center text-gray-400 mt-12">
                            <div className="text-5xl mb-4">🛒</div>
                            <p className="text-sm">Your selection is empty.</p>
                            <p className="text-sm mt-1">Browse categories and add items!</p>
                        </div>
                    ) : (
                        <ul className="space-y-3">
                            {items.map((item) => (
                                <li
                                    key={`${item.item_type}-${item.item_id}`}
                                    className="flex items-start gap-3 bg-gray-50 rounded-lg p-3"
                                >
                                    {/* Item info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-wa-navy truncate">
                                            {item.name}
                                        </p>
                                        <p className="text-xs text-gray-500 capitalize">
                                            {item.item_type}
                                        </p>
                                        <p className="text-xs text-wa-blue font-medium mt-1">
                                            CHF {(item.unit_price * item.quantity).toFixed(2)}
                                        </p>
                                    </div>

                                    {/* Quantity controls */}
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => updateQuantity(item.item_type, item.item_id, item.quantity - 1)}
                                            className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm font-bold cursor-pointer transition-colors"
                                        >
                                            −
                                        </button>
                                        <span className="w-8 text-center text-sm font-semibold">
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() => updateQuantity(item.item_type, item.item_id, item.quantity + 1)}
                                            className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm font-bold cursor-pointer transition-colors"
                                        >
                                            +
                                        </button>
                                    </div>

                                    {/* Remove button */}
                                    <button
                                        onClick={() => removeItem(item.item_type, item.item_id)}
                                        className="text-red-400 hover:text-red-600 transition-colors cursor-pointer p-1"
                                        title="Remove item"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Footer — Total + Submit */}
                {items.length > 0 && (
                    <div className="border-t px-4 py-4 bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm font-semibold text-gray-600">
                                Estimated Total
                            </span>
                            <span className="text-lg font-bold text-wa-navy">
                                CHF {totalCost.toFixed(2)}
                            </span>
                        </div>
                        <button
                            onClick={handleSubmitRequest}
                            className="w-full bg-wa-blue text-white py-3 rounded-lg font-semibold hover:bg-wa-ocean transition-colors cursor-pointer"
                        >
                            Submit Request →
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}

export default SelectionDrawer;
