// AdminPanel is the admin interface for inventory managers.
// Access is scoped per group — not every user sees every section:
//   Requests  → admin group only
//   Gifts     → gifts_access (or admin)
//   Apparel   → apparel_access (or admin)
//   All other sections (coming soon) → admin only
//
// On load, if the user has none of those groups, they are redirected to home.
// The sidebar only shows the sections the current user can access.
// The initial active section is set to the first accessible tab after user info loads.

import { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import Header from "../components/Header";
import SelectionDrawer from "../components/SelectionDrawer";
import AdminRequests from "../components/admin/AdminRequests";
import AdminGifts from "../components/admin/AdminGifts";
import AdminApparel from "../components/admin/AdminApparel";
import AdminOffice from "../components/admin/AdminOffice";
import AdminMisc from "../components/admin/AdminMisc";
import AdminExecutive from "../components/admin/AdminExecutive";

// Full list of sidebar sections. Access requirements are applied at render time.
const NAV_ITEMS = [
    {
        id: "requests",
        label: "Requests",
        icon: "📋",
        description: "Manage incoming item requests",
        requiredGroup: "requests_access",
    },
    {
        id: "gifts",
        label: "Gifts",
        icon: "🛍️",
        description: "Manage gifts inventory",
        requiredGroup: "gifts_access",
    },
    {
        id: "apparel",
        label: "Apparel",
        icon: "👕",
        description: "Manage apparel inventory",
        requiredGroup: "apparel_access",
    },
    {
        id: "executive",
        label: "Executive Office",
        icon: "💼",
        description: "Manage executive items",
        requiredGroup: "executive_access",
    },
    {
        id: "office",
        label: "Office & Events",
        icon: "🗂️",
        description: "Manage office and event materials",
        requiredGroup: "office_access",
    },
    {
        id: "miscellaneous",
        label: "Miscellaneous",
        icon: "🧰",
        description: "Manage miscellaneous inventory",
        requiredGroup: "misc_access",
    },
    {
        id: "it",
        label: "IT Assets",
        icon: "🖥️",
        description: "Manage IT equipment",
        requiredGroup: "it_access",
    },
    {
        id: "dashboard",
        label: "Dashboard",
        icon: "📈",
        description: "Statistics and reports",
        requiredGroup: "dashboard_access",
    },
    {
        id: "settings",
        label: "Settings",
        icon: "⚙️",
        description: "Categories, departments, reasons",
        requiredGroup: "settings_access",
    },
];

function AdminPanel() {
    const { hasAccess, loadingUser } = useUser();
    const [activeSection, setActiveSection] = useState("requests");
    const [selectionOpen, setSelectionOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();

    // Compute which nav items are visible for this user.
    // During loading, hasAccess returns false for everything so visibleNavItems is empty
    // until user info resolves — that's fine because we show a loading state below.
    const visibleNavItems = NAV_ITEMS.filter(item => hasAccess(item.requiredGroup));

    // After user info loads, ensure the active section is one the user can access.
    // If the default "requests" isn't accessible (e.g. gifts-only user), switch to
    // the first section that is.
    useEffect(() => {
        if (!loadingUser && visibleNavItems.length > 0) {
            if (!visibleNavItems.find(item => item.id === activeSection)) {
                setActiveSection(visibleNavItems[0].id);
            }
        }
    }, [loadingUser]);

    // Wait for user info before enforcing access rules
    if (loadingUser) {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;
    }

    // Redirect anyone with no relevant access to home
    if (
        !hasAccess("admin") &&
        !hasAccess("gifts_access") &&
        !hasAccess("apparel_access") &&
        !hasAccess("office_access") &&
        !hasAccess("misc_access") &&
        !hasAccess("executive_access") &&
        !hasAccess("requests_access")
    ) {
        return <Navigate to="/" />;
    }

    const activeItem = visibleNavItems.find((i) => i.id === activeSection);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Header onSelectionOpen={() => setSelectionOpen(true)} />

            <div className="flex flex-1 overflow-hidden">
                {/* MOBILE: sidebar toggle button */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="xl:hidden fixed top-20 right-4 z-50 bg-wa-cyan text-white px-3 py-2 rounded-lg shadow-lg cursor-pointer text-sm "
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
                    xl:translate-x-0
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

                    {/* Navigation — only shows sections the user has access to */}
                    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                        {visibleNavItems.map((item) => (
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
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 xl:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* MAIN CONTENT */}
                <main className="flex-1 overflow-y-auto p-4 xl:p-8 xl:ml-64">
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
                        ) : activeSection === "apparel" ? (
                            <AdminApparel />
                        ) : activeSection === "office" ? (
                            <AdminOffice />
                        ) : activeSection === "miscellaneous" ? (
                            <AdminMisc />
                        ) : activeSection === "executive" ? (
                            <AdminExecutive />
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
