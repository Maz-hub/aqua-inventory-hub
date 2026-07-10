/**
 * Home Page - Inventory Dashboard
 *
 * Main landing page after login showing inventory sections.
 * Only categories the user has access to are shown; inaccessible ones are
 * hidden entirely rather than shown greyed-out.
 * Access is determined by the user's group membership from UserContext.
 */

import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import SelectionDrawer from "../components/SelectionDrawer";
import { useUser } from "../context/UserContext";
import { useState } from "react";

function Home() {
    const navigate = useNavigate();
    const { hasAccess, loadingUser } = useUser();
    const [selectionOpen, setSelectionOpen] = useState(false);

    // CategoryCard is only ever rendered for categories the user can access
    // (inaccessible ones are filtered out before rendering), so it no longer
    // needs to express a disabled/no-access state.
    const CategoryCard = ({ emoji, title, description, subtext, route }) => {
        return (
            <div
                onClick={() => navigate(route)}
                className="bg-white rounded-lg shadow-lg p-8 border-2 border-transparent transition-shadow hover:shadow-xl cursor-pointer hover:border-wa-blue"
            >
                <div className="text-center">
                    <div className="text-6xl mb-4">{emoji}</div>
                    <h2 className="text-2xl font-bold text-wa-navy mb-3">
                        {title}
                    </h2>
                    <p className="text-gray-600 mb-4">{description}</p>
                    <div className="text-wa-blue font-semibold">
                        {subtext}
                    </div>
                </div>
            </div>
        );
    };

    if (loadingUser) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-wa-navy text-xl font-semibold">
                    Loading...
                </div>
            </div>
        );
    }

    // Full list of category tiles with their access requirements. Filtered down
    // to only what this user can access before rendering, so inaccessible
    // sections never appear (rather than showing greyed-out).
    const categories = [
        {
            emoji: "🛍️",
            title: "Gifts",
            subtext: "View →",
            canAccess: hasAccess("gifts_viewer") || hasAccess("gifts_access") || hasAccess("admin"),
            route: "/gifts",
        },
        {
            emoji: "👕",
            title: "Apparel",
            subtext: "View →",
            canAccess: hasAccess("apparel_viewer") || hasAccess("apparel_access") || hasAccess("admin"),
            route: "/apparel",
        },
        {
            emoji: "📋",
            title: "Office & Events",
            subtext: "View →",
            canAccess: hasAccess("office_viewer") || hasAccess("admin"),
            route: "/office",
        },
        {
            emoji: "🧰",
            title: "Miscellaneous",
            subtext: "View →",
            canAccess: hasAccess("misc_viewer") || hasAccess("misc_access") || hasAccess("admin"),
            route: "/miscellaneous",
        },
        {
            emoji: "💼",
            title: "Executive Office",
            subtext: "View →",
            canAccess: hasAccess("executive_viewer") || hasAccess("executive_access") || hasAccess("admin"),
            route: "/executive",
        },
        {
            emoji: "🖥️",
            title: "IT Assets",
            subtext: "View →",
            canAccess: hasAccess("it_viewer") || hasAccess("it_access") || hasAccess("admin"),
            route: "/it",
        },
    ];

    const visibleCategories = categories.filter((category) => category.canAccess);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Header onSelectionOpen={() => setSelectionOpen(true)} />

            <div className="flex-1 p-4 md:p-8">
                {/* Header */}
                <div className="max-w-7xl mx-auto mt-5 mb-8 md:mb-12">
                    <h1 className="text-2xl md:text-4xl font-bold text-wa-navy mb-2 text-center">
                        Aqua Inventory Hub
                    </h1>
                </div>

                {/* Inventory Category Cards — only categories the user can access are shown */}
                {visibleCategories.length === 0 ? (
                    <div className="max-w-2xl mx-auto text-center py-16">
                        <p className="text-gray-500 text-lg">
                            No sections available yet. Please contact your administrator.
                        </p>
                    </div>
                ) : (
                    <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 auto-rows-fr">
                        {visibleCategories.map((category) => (
                            <CategoryCard
                                key={category.route}
                                emoji={category.emoji}
                                title={category.title}
                                subtext={category.subtext}
                                route={category.route}
                            />
                        ))}
                    </div>
                )}
            </div>
            <Footer />
            <SelectionDrawer
                isOpen={selectionOpen}
                onClose={() => setSelectionOpen(false)}
            />
        </div>
    );
}

export default Home;
