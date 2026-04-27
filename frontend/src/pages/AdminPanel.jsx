/**
 * Admin Panel
 *
 * Shopify-style admin interface for inventory managers.
 * Left sidebar navigation with main content area.
 * Accessible to admin group users only.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import SelectionDrawer from "../components/SelectionDrawer";

// Sidebar navigation items
const NAV_ITEMS = [
    {
        id: "requests",
        label: "Requests",
        icon: "📋",
        description: "Manage incoming item requests"
    },
    {
        id: "gifts",
        label: "Gifts",
        icon: "🛍️",
        description: "Manage gifts inventory"
    },
    {
        id: "apparel",
        label: "Apparel",
        icon: "👕",
        description: "Manage apparel inventory"
    },
    {
        id: "executive",
        label: "Executive Office",
        icon: "💼",
        description: "Manage executive items"
    },
    {
        id: "office",
        label: "Office & Events",
        icon: "🗂️",
        description: "Manage office and event materials"
    },
    {
        id: "it",
        label: "IT Assets",
        icon: "🖥️",
        description: "Manage IT equipment"
    },
    {
        id: "dashboard",
        label: "Dashboard",
        icon: "📈",
        description: "Statistics and reports"
    },
    {
        id: "settings",
        label: "Settings",
        icon: "⚙️",
        description: "Categories, departments, reasons"
    },
];

function AdminPanel() {
    const [activeSection, setActiveSection] = useState("requests");
    const [selectionOpen, setSelectionOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();

    const activeItem = NAV_ITEMS.find(i => i.id === activeSection);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Header onSelectionOpen={() => setSelectionOpen(true)} />

            <div className="flex flex-1 overflow-hidden">

                {/* MOBILE: sidebar toggle button */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="md:hidden fixed bottom-4 left-4 z-50 bg-wa-navy text-white p-3 rounded-full shadow-lg cursor-pointer"
                >
                    ☰
                </button>

                {/* SIDEBAR */}
                <aside className={`
                    fixed md:static inset-y-0 left-0 z-40
                    w-64 bg-wa-navy text-white
                    flex flex-col
                    transform transition-transform duration-300 ease-in-out
                    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
                    md:translate-x-0
                    mt-0
                `}>
                    {/* Sidebar Header */}
                    <div className="px-6 py-5 border-b border-white/10">
                        <h2 className="text-lg font-bold">Admin Panel</h2>
                        <p className="text-xs text-white/50 mt-0.5">
                            Inventory Management
                        </p>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                        {NAV_ITEMS.map(item => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveSection(item.id);
                                    setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer text-left
                                    ${activeSection === item.id
                                        ? "bg-white/20 text-white"
                                        : "text-white/70 hover:bg-white/10 hover:text-white"
                                    }`}
                            >
                                <span>{item.icon}</span>
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    {/* Back to app */}
                    <div className="px-3 py-4 border-t border-white/10">
                        <button
                            onClick={() => navigate("/")}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                        >
                            <span>←</span>
                            <span>Back to App</span>
                        </button>
                    </div>
                </aside>

                {/* Mobile sidebar backdrop */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 md:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* MAIN CONTENT */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-6xl mx-auto">

                        {/* Page title */}
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold text-wa-navy">
                                {activeItem?.icon} {activeItem?.label}
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                {activeItem?.description}
                            </p>
                        </div>

                        {/* Content placeholder per section */}
                        <div className="bg-white rounded-2xl shadow p-8 text-center">
                            <div className="text-5xl mb-4">{activeItem?.icon}</div>
                            <p className="text-gray-500">
                                {activeItem?.label} management coming soon.
                            </p>
                        </div>
                    </div>
                </main>
            </div>

            <SelectionDrawer
                isOpen={selectionOpen}
                onClose={() => setSelectionOpen(false)}
            />
        </div>
    );
}

export default AdminPanel;
