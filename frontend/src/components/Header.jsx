/**
 * Header Component
 *
 * Persistent navigation bar shown on all protected pages.
 * Contains: logo/app name, Selection icon with badge, user menu.
 * Fully responsive — compact on mobile, full on desktop.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useSelection } from "../context/SelectionContext";
import logo from "../assets/images/WorldAquatics-Logo_CMYK_White_Horiz.png";

function Header({ onSelectionOpen }) {
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const { user, clearUser, hasAccess } = useUser();
    const { totalItems } = useSelection();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        clearUser();
        navigate("/login");
    };

    return (
        <header className="bg-wa-navy text-white px-4 py-3 flex items-center justify-between shadow-lg sticky top-0 z-50">
            {/* LEFT — World Aquatics Logo */}
            <div
                className="flex items-center"
                onClick={() => navigate("/")}
                title="Go to Home"
            >
                <img
                    src={logo}
                    alt="World Aquatics"
                    className="h-10 md:h-14 w-auto"
                />
            </div>

            {/* RIGHT — Selection + User Menu */}
            <div className="flex items-center gap-4">
                {/* Selection Icon with Badge */}
                <button
                    onClick={onSelectionOpen}
                    className="relative p-2 rounded-full hover:bg-wa-blue transition-colors"
                    title="View your Selection"
                >
                    {/* Basket icon */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 3h2l.4 2M7 13h10l4-9H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                    </svg>
                    {/* Badge — only shows when items in selection */}
                    {totalItems > 0 && (
                        <span className="absolute -top-1 -right-1 bg-wa-cyan text-white text-xs font-semibold rounded-full min-w-4.5 h-4.5 flex items-center justify-center px-1 leading-none">
                            {totalItems}
                        </span>
                    )}
                </button>

                {/* User Menu */}
                <div className="relative">
                    <button
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className="flex items-center gap-2 p-2 rounded-full hover:bg-wa-blue transition-colors cursor-pointer"
                        title={user?.username}
                    >
                        {/* User icon */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                        </svg>
                        {/* Username — hidden on mobile */}
                        <span className="hidden md:block text-sm font-medium">
                            {user?.username}
                        </span>
                    </button>

                    {/* Dropdown Menu */}
                    {userMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 z-50">
                            <div className="px-4 py-2 text-sm text-gray-500 border-b">
                                {user?.username}
                            </div>
                            <button
                                onClick={() => {
                                    navigate("/requests/mine");
                                    setUserMenuOpen(false);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-wa-navy hover:bg-gray-100 cursor-pointer font-medium"
                            >
                                My Requests
                            </button>
                            {hasAccess("admin") && (
                                <button
                                    onClick={() => {
                                        navigate("/admin-panel");
                                        setUserMenuOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-wa-navy hover:bg-gray-100 cursor-pointer font-medium"
                                >
                                    Admin Panel
                                </button>
                            )}
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 cursor-pointer font-medium"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;
