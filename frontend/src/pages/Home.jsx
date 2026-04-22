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
import { useUser } from "../context/UserContext";

function Home() {
    const [gifts, setGifts] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { hasAccess, clearUser, loadingUser } = useUser();
    // hasAccess checks if user belongs to a specific group
    // clearUser clears user info from context on logout

    useEffect(() => {
        // Only fetch gifts count if user has access
        if (hasAccess("gifts_access")) {
            getGifts();
        }
    }, []);

    const getGifts = () => {
        // Fetches gift count to display on homepage
        setLoading(true);
        api.get("/api/gifts/")
            .then((res) => setGifts(res.data))
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    };

    const handleLogout = () => {
        // Clear tokens and user context, then redirect to login
        localStorage.clear();
        clearUser();
        navigate("/login");
    };

    // Reusable component for each inventory category card
    const CategoryCard = ({
        emoji,
        title,
        description,
        subtext,
        accessGroup,
        route,
    }) => {
        const canAccess = hasAccess(accessGroup);
        // Check if user has the required group for this category

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
            <div className="flex-1 p-8">
                {/* Header */}
                <div className="max-w-7xl mx-auto mt-5 mb-12">
                    <h1 className="text-4xl font-bold text-wa-navy mb-2 text-center">
                        Aqua Inventory Hub
                    </h1>
                </div>

                {/* Inventory Category Cards */}
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8">
                    <CategoryCard
                        emoji="🛍️"
                        title="Gifts"
                        description="Promotional items, branded gifts and giveaways"
                        subtext={
                            loading
                                ? "Loading..."
                                : `${gifts.length} items in stock`
                        }
                        accessGroup="gifts_access"
                        route="/gifts"
                    />
                    <CategoryCard
                        emoji="👕"
                        title="Apparel"
                        description="361° clothing for staff and events"
                        subtext="Manage Inventory"
                        accessGroup="apparel_access"
                        route="/apparel"
                    />
                </div>
            </div>

            {/* Logout Button */}
            <div className="text-center mt-12 mb-8">
                <button onClick={handleLogout} className="btn_logout">
                    Logout
                </button>
            </div>

            <Footer />
        </div>
    );
}

export default Home;
