/**
 * Home Page - Inventory Dashboard
 *
 * Main landing page after login showing inventory sections.
 * Categories are grayed out if the user does not have access.
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

    // CategoryCard accepts a pre-computed canAccess boolean so each tile can
    // express its own multi-group access logic at the call site.
    const CategoryCard = ({
        emoji,
        title,
        description,
        subtext,
        canAccess,
        route,
    }) => {
        return (
            <div
                onClick={() => canAccess && navigate(route)}
                className={`bg-white rounded-lg shadow-lg p-8 border-2 transition-shadow
          ${
              canAccess
                  ? "hover:shadow-xl cursor-pointer border-transparent hover:border-wa-blue"
                  : "opacity-50 cursor-not-allowed border-transparent"
          }`}
            >
                <div className="text-center">
                    <div className="text-6xl mb-4">{emoji}</div>
                    <h2 className="text-2xl font-bold text-wa-navy mb-3">
                        {title}
                    </h2>
                    <p className="text-gray-600 mb-4">{description}</p>
                    <div
                        className={
                            canAccess
                                ? "text-wa-blue font-semibold"
                                : "text-gray-400 font-semibold text-sm"
                        }
                    >
                        {canAccess
                            ? subtext
                            : "You do not have access to this section."}
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

                {/* Inventory Category Cards */}
                <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                    <CategoryCard
                        emoji="🛍️"
                        title="Gifts"
                        subtext="Browse inventory"
                        canAccess={hasAccess("gifts_viewer") || hasAccess("gifts_access") || hasAccess("admin")}
                        route="/gifts"
                    />
                    <CategoryCard
                        emoji="👕"
                        title="Apparel"
                        subtext="Browse inventory"
                        canAccess={hasAccess("apparel_viewer") || hasAccess("apparel_access") || hasAccess("admin")}
                        route="/apparel"
                    />
                    <CategoryCard
                        emoji="📋"
                        title="Office & Events"
                        subtext="Browse inventory"
                        canAccess={hasAccess("office_viewer") || hasAccess("admin")}
                        route="/office"
                    />
                    <CategoryCard
                        emoji="💼"
                        title="Executive Office"
                        subtext=""
                        canAccess={hasAccess("executive_viewer") || hasAccess("executive_access") || hasAccess("admin")}
                        route="/executive"
                    />
                    <CategoryCard
                        emoji="🖥️"
                        title="IT Assets"
                        subtext=""
                        canAccess={hasAccess("it_viewer") || hasAccess("it_access") || hasAccess("admin")}
                        route="/it"
                    />
                </div>
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
