import { createContext, useState, useContext } from "react";

// ============================================
// SELECTION CONTEXT
// Manages the user's current item selection
// (equivalent to a shopping cart)
// Accessible from any page or component
// ============================================

const SelectionContext = createContext(null);

export function SelectionProvider({ children }) {
    const [items, setItems] = useState([]);
    // Each item: { id, item_type, item_id, name, unit_price, quantity, image }

    const addItem = (item) => {
        // Check if item already exists in selection
        const existing = items.find(
            i => i.item_type === item.item_type && i.item_id === item.item_id
        );

        if (existing) {
            // Item exists — increase quantity
            setItems(items.map(i =>
                i.item_type === item.item_type && i.item_id === item.item_id
                    ? { ...i, quantity: i.quantity + item.quantity }
                    : i
            ));
        } else {
            // New item — add to selection
            setItems([...items, item]);
        }
    };

    const removeItem = (item_type, item_id) => {
        // Remove a specific item from selection
        setItems(items.filter(
            i => !(i.item_type === item_type && i.item_id === item_id)
        ));
    };

    const updateQuantity = (item_type, item_id, quantity) => {
        // Update quantity for a specific item
        if (quantity <= 0) {
            removeItem(item_type, item_id);
            return;
        }
        setItems(items.map(i =>
            i.item_type === item_type && i.item_id === item_id
                ? { ...i, quantity }
                : i
        ));
    };

    const clearSelection = () => {
        // Empty the selection after successful submission
        setItems([]);
    };

    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
    // Total number of items across all lines — shown in header badge

    const totalCost = items.reduce(
        (sum, i) => sum + (i.unit_price * i.quantity), 0
    );
    // Total estimated cost across all items

    return (
        <SelectionContext.Provider value={{
            items,
            addItem,
            removeItem,
            updateQuantity,
            clearSelection,
            totalItems,
            totalCost,
        }}>
            {children}
        </SelectionContext.Provider>
    );
}

// Custom hook for easy access to selection context
export function useSelection() {
    return useContext(SelectionContext);
}

export default SelectionContext;
