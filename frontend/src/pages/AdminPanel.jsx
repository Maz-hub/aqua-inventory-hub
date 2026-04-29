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
import AdminRequests from "../components/admin/AdminRequests";
import AdminGifts from "../components/admin/AdminGifts";

// Sidebar navigation items
const NAV_ITEMS = [
    {
        id: "requests",
        label: "Requests",
        icon: "📋",
        description: "Manage incoming item requests",
    },
    {
        id: "gifts",
        label: "Gifts",
        icon: "🛍️",
        description: "Manage gifts inventory",
    },
    {
        id: "apparel",
        label: "Apparel",
        icon: "👕",
        description: "Manage apparel inventory",
    },
    {
        id: "executive",
        label: "Executive Office",
        icon: "💼",
        description: "Manage executive items",
    },
    {
        id: "office",
        label: "Office & Events",
        icon: "🗂️",
        description: "Manage office and event materials",
    },
    {
        id: "it",
        label: "IT Assets",
        icon: "🖥️",
        description: "Manage IT equipment",
    },
    {
        id: "dashboard",
        label: "Dashboard",
        icon: "📈",
        description: "Statistics and reports",
    },
    {
        id: "settings",
        label: "Settings",
        icon: "⚙️",
        description: "Categories, departments, reasons",
    },
];

function AdminPanel() {
    const [activeSection, setActiveSection] = useState("requests");
    const [selectionOpen, setSelectionOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();

    const activeItem = NAV_ITEMS.find((i) => i.id === activeSection);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Header onSelectionOpen={() => setSelectionOpen(true)} />

            <div className="flex flex-1 overflow-hidden">
                {/* MOBILE: sidebar toggle button */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="md:hidden fixed top-20 right-4 z-50 bg-wa-cyan text-white px-3 py-2 rounded-lg shadow-lg cursor-pointer text-sm "
                >
                    ☰ Menu
                </button>

                {/* SIDEBAR */}
                <aside
                    className={`
                    fixed top-0 left-0 z-40
                    w-64 bg-wa-navy text-white
                    flex flex-col
                    transform transition-transform duration-300 ease-in-out
                    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
                    md:translate-x-0
                    h-screen
                `}
                    style={{ paddingTop: "64px" }}
                >
                    {/* Sidebar Header */}
                    <div className="px-6 pb-5 pt-10 border-b border-white/10 shrink-0">
                        <h2 className="text-lg font-bold">Admin Panel</h2>
                        <p className="text-xs text-white/50 mt-0.5">
                            Aqua Management Hub
                        </p>
                    </div>

                    {/* Navigation — scrollable if needed */}
                    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                        {NAV_ITEMS.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveSection(item.id);
                                    setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer text-left
                                    ${
                                        activeSection === item.id
                                            ? "bg-white/20 text-white"
                                            : "text-white/70 hover:bg-white/10 hover:text-white"
                                    }`}
                            >
                                <span>{item.icon}</span>
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    {/* Back to app — always at bottom */}
                    <div className="px-3 py-4 border-t border-white/10 shrink-0">
                        <button
                            onClick={() => navigate("/")}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                        >
                            <span>←</span>
                            <span>Back to Hub</span>
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
                <main className="flex-1 overflow-y-auto p-4 md:p-8 md:ml-64">
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

                        {/* Content per section */}
                        {activeSection === "requests" ? (
                            <AdminRequests />
                        ) : activeSection === "gifts" ? (
                            <AdminGifts />
                        ) : (
                            <div className="bg-white rounded-2xl shadow p-8 text-center">
                                <div className="text-5xl mb-4">
                                    {activeItem?.icon}
                                </div>
                                <p className="text-gray-500">
                                    {activeItem?.label} management coming soon.
                                </p>
                            </div>
                        )}
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
