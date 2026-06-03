/**
 * Home Page - Inventory Dashboard
 *
 * Main landing page after login showing inventory sections.
 * Categories are grayed out if the user does not have access.
 * Access is determined by the user's group membership from UserContext.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Footer from "../components/Footer";
import Header from "../components/Header";
import SelectionDrawer from "../components/SelectionDrawer";
import { useUser } from "../context/UserContext";

function Home() {
    const [gifts, setGifts] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { hasAccess, loadingUser } = useUser();
    const [selectionOpen, setSelectionOpen] = useState(false);

    useEffect(() => {
        // Fetch gift count for the tile subtext — available to both viewers and managers
        if (hasAccess("gifts_viewer") || hasAccess("gifts_access")) {
            getGifts();
        }
    }, []);

    const getGifts = () => {
        setLoading(true);
        api.get("/api/gifts/")
            .then((res) => setGifts(res.data))
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    };

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
                        subtext={loading ? "Loading..." : `${gifts.length} items in stock`}
                        canAccess={hasAccess("gifts_viewer") || hasAccess("gifts_access") || hasAccess("admin")}
                        route="/gifts"
                    />
                    <CategoryCard
                        emoji="👕"
                        title="Apparel"
                        subtext="Manage Inventory"
                        canAccess={hasAccess("apparel_viewer") || hasAccess("apparel_access") || hasAccess("admin")}
                        route="/apparel"
                    />
                    <CategoryCard
                        emoji="📋"
                        title="Office & Events"
                        subtext="Manage Inventory"
                        canAccess={hasAccess("office_viewer") || hasAccess("admin")}
                        route="/office"
                    />
                    <CategoryCard
                        emoji="💼"
                        title="Executive Office"
                        subtext="Manage Inventory"
                        canAccess={hasAccess("executive_viewer") || hasAccess("executive_access") || hasAccess("admin")}
                        route="/executive"
                    />
                    <CategoryCard
                        emoji="🖥️"
                        title="IT Assets"
                        subtext="Manage Inventory"
                        canAccess={hasAccess("it_viewer") || hasAccess("it_access") || hasAccess("admin")}
                        route="/it"
                    />
                    <CategoryCard
                        emoji="📈"
                        title="Dashboard"
                        subtext="View Dashboard"
                        canAccess={hasAccess("admin")}
                        route="/dashboard"
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
