/**
 * SelectionDrawer Component
 *
 * Elegant slide-in panel for the current item selection.
 * Desktop/tablet: slides in from the right.
 * Mobile: slides up as a bottom sheet.
 * No dark overlay — background stays fully visible.
 */

import { useEffect, useState } from "react";
import { useSelection } from "../context/SelectionContext";
import { useNavigate } from "react-router-dom";

function SelectionDrawer({ isOpen, onClose }) {
    const { items, removeItem, updateQuantity, totalItems, totalCost } =
        useSelection();
    const navigate = useNavigate();
    const [visible, setVisible] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setMounted(true);
            setTimeout(() => setVisible(true), 10);
        } else {
            setVisible(false);
            setTimeout(() => setMounted(false), 300);
        }
    }, [isOpen]);

    if (!mounted) return null;

    const handleSubmitRequest = () => {
        onClose();
        navigate("/requests/new");
    };

    return (
        <>
            {/* Subtle transparent backdrop — just catches clicks, no dark overlay */}
            <div className="fixed inset-0 z-40" onClick={onClose} />

            {/* DESKTOP / TABLET: right side drawer */}
            <div
                className={`
                hidden md:flex
                fixed top-0 right-0 h-full z-50
                w-80 lg:w-96
                flex-col
                bg-white
                border-l border-gray-100
                shadow-[-8px_0_32px_rgba(0,0,0,0.08)]
                transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                ${visible ? "translate-x-0" : "translate-x-full"}
            `}
            >
                <DrawerContent
                    items={items}
                    totalItems={totalItems}
                    totalCost={totalCost}
                    removeItem={removeItem}
                    updateQuantity={updateQuantity}
                    onClose={onClose}
                    onSubmit={handleSubmitRequest}
                    onContinue={onClose}
                />
            </div>

            {/* MOBILE: slides in from right, full screen */}
            <div
                className={`
                flex md:hidden
                fixed top-0 right-0 h-full w-full z-50
                flex-col
                bg-white
                shadow-[-8px_0_32px_rgba(0,0,0,0.08)]
                transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                ${visible ? "translate-x-0" : "translate-x-full"}
            `}
            >
                <DrawerContent
                    items={items}
                    totalItems={totalItems}
                    totalCost={totalCost}
                    removeItem={removeItem}
                    updateQuantity={updateQuantity}
                    onClose={onClose}
                    onSubmit={handleSubmitRequest}
                    onContinue={onClose}
                    isMobile
                />
            </div>
        </>
    );
}

// ─── Shared drawer content (used by both mobile and desktop) ───
function DrawerContent({
    items,
    totalItems,
    totalCost,
    removeItem,
    updateQuantity,
    onClose,
    onSubmit,
    onContinue,
    isMobile,
}) {
    return (
        <>
            {/* Header */}
            <div
                className={`flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0 ${isMobile ? "" : "bg-white"}`}
            >
                <div>
                    <h2 className="text-base font-bold text-wa-navy">
                        My Selection
                    </h2>
                    {totalItems > 0 && (
                        <p className="text-xs text-gray-400 mt-0.5">
                            {totalItems} item{totalItems !== 1 ? "s" : ""} · CHF{" "}
                            {totalCost.toFixed(2)}
                        </p>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                    title="Close"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </div>

            {/* Items list */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-8 w-8 text-gray-300"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M3 3h2l.4 2M7 13h10l4-9H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>
                        </div>
                        <p className="text-sm font-medium text-gray-500">
                            Your selection is empty
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            Browse a category and add items
                        </p>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {items.map((item) => (
                            <li
                                key={`${item.item_type}-${item.item_id}`}
                                className="flex items-center gap-1 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                                {/* Item info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-wa-navy truncate">
                                        {item.name}
                                    </p>
                                    <p className="text-xs text-gray-400 capitalize mt-1.5">
                                        {item.item_type}
                                    </p>
                                    <p className="text-xs font-medium text-wa-blue mt-1.5">
                                        CHF{" "}
                                        {(
                                            item.unit_price * item.quantity
                                        ).toFixed(2)}
                                    </p>
                                </div>

                                {/* Quantity controls */}
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                        onClick={() =>
                                            updateQuantity(
                                                item.item_type,
                                                item.item_id,
                                                item.quantity - 1,
                                            )
                                        }
                                        className="w-6 h-6 rounded-full bg-white border border-gray-200 hover:border-gray-400 flex items-center justify-center text-xs font-bold text-gray-600 cursor-pointer transition-colors"
                                    >
                                        −
                                    </button>
                                    <input
                                        type="number"
                                        min="1"
                                        max={item.max_quantity}
                                        value={item.quantity}
                                        onChange={(e) => {
                                            const val = Math.min(
                                                Math.max(
                                                    1,
                                                    parseInt(e.target.value) ||
                                                        1,
                                                ),
                                                item.max_quantity,
                                            );
                                            updateQuantity(
                                                item.item_type,
                                                item.item_id,
                                                val,
                                            );
                                        }}
                                        className="w-20 text-center text-sm text-wa-navy border border-gray-200 rounded-md py-0.5 focus:outline-none focus:border-wa-blue"
                                    />
                                    <button
                                        onClick={() => {
                                            if (
                                                item.quantity <
                                                item.max_quantity
                                            ) {
                                                updateQuantity(
                                                    item.item_type,
                                                    item.item_id,
                                                    item.quantity + 1,
                                                );
                                            }
                                        }}
                                        className={`w-6 h-6 rounded-full bg-white border flex items-center justify-center text-xs font-bold transition-colors
                                            ${
                                                item.quantity >=
                                                item.max_quantity
                                                    ? "border-gray-100 text-gray-300 cursor-not-allowed"
                                                    : "border-gray-200 hover:border-gray-400 text-gray-600 cursor-pointer"
                                            }`}
                                    >
                                        +
                                    </button>
                                </div>

                                {/* Remove */}
                                <button
                                    onClick={() =>
                                        removeItem(item.item_type, item.item_id)
                                    }
                                    className="w-6 h-6 flex items-center justify-center text-gray-300 hover:text-red-400 cursor-pointer transition-colors shrink-0"
                                    title="Remove"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
                <div className="shrink-0 px-5 py-4 border-t border-gray-100 bg-white">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-gray-500">
                            Estimated Total
                        </span>
                        <span className="text-lg font-bold text-wa-navy">
                            CHF {totalCost.toFixed(2)}
                        </span>
                    </div>
                    <button
                        onClick={onContinue}
                        className="w-full py-3 rounded-xl text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                        Continue Browsing
                    </button>
                    <button
                        onClick={onSubmit}
                        className="w-full mt-2 bg-wa-blue hover:bg-wa-ocean text-white py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                    >
                        Submit Request
                    </button>
                </div>
            )}
        </>
    );
}

export default SelectionDrawer;
