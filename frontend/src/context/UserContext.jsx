import { createContext, useState, useContext, useEffect } from "react";
import api from "../api";

// ============================================
// USER CONTEXT
// Stores the logged-in user's info and groups
// Available to all components in the app
// ============================================

const UserContext = createContext(null);

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    // Stores user info: username, groups, department

    const [loadingUser, setLoadingUser] = useState(true);
    // Tracks whether we're still fetching user info

    const fetchUser = () => {
        // Fetch current user info from backend
        api.get("/api/user/me/")
            .then((res) => {
                setUser(res.data);
                // Store user info including groups
            })
            .catch(() => {
                setUser(null);
                // Clear user if not authenticated
            })
            .finally(() => {
                setLoadingUser(false);
            });
    };

    useEffect(() => {
        // Only fetch user info if a token exists in localStorage
        // Prevents 401 errors on initial load before authentication is confirmed
        const token = localStorage.getItem('access');
        if (token) {
            fetchUser();
        } else {
            setLoadingUser(false);
        }
    }, []);

    const hasAccess = (group) => {
        // Helper function to check if user has a specific group
        // Used by pages to show/hide/gray out sections
        if (!user) return false;
        if (user.is_superuser) return true;
        return user.groups.includes(group) || user.groups.includes('admin');
    };

    const clearUser = () => {
        // Called on logout to clear user info
        setUser(null);
    };

    return (
        <UserContext.Provider value={{ user, loadingUser, hasAccess, clearUser, fetchUser }}>
            {children}
        </UserContext.Provider>
    );
}

// Custom hook for easy access to user context
export function useUser() {
    return useContext(UserContext);
}

export default UserContext;
