// ProtectedRoute wraps any page that requires authentication.
// It checks JWT token validity and refreshes expired tokens automatically.
// Redirects to /login if the token is missing or cannot be refreshed.
//
// Optional prop:
//   requireGroups - array of group names; if provided, the user must belong to at
//                   least one of them (or be a superuser) after the JWT check passes.
//                   If the user is authenticated but has none of the required groups,
//                   they are redirected to / instead of /login.
//
// Loading states:
//   isAuthorized === null   — JWT check still running
//   requireGroups provided and loadingUser === true — waiting for user info from /api/user/me/
//   Both resolved           — render children or redirect

import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";
import { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";


function ProtectedRoute({ children, requireGroups }) {
    const [isAuthorized, setIsAuthorized] = useState(null);
    const { user, loadingUser } = useUser();

    useEffect(() => {
        auth().catch(() => setIsAuthorized(false));
    }, []);

    const refreshToken = async () => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);
        try {
            const res = await api.post("/api/token/refresh/", {
                refresh: refreshToken,
            });
            if (res.status === 200) {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                setIsAuthorized(true);
            } else {
                setIsAuthorized(false);
            }
        } catch (error) {
            console.log(error);
            setIsAuthorized(false);
        }
    };

    const auth = async () => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token) {
            setIsAuthorized(false);
            return;
        }
        const decoded = jwtDecode(token);
        const tokenExpiration = decoded.exp;
        const now = Date.now() / 1000;
        if (tokenExpiration < now) {
            await refreshToken();
        } else {
            setIsAuthorized(true);
        }
    };

    // Still checking JWT validity
    if (isAuthorized === null) {
        return <div>Loading...</div>;
    }

    // JWT invalid — send to login
    if (!isAuthorized) {
        return <Navigate to="/login" />;
    }

    // JWT valid but group check is needed and user info hasn't loaded yet
    if (requireGroups && loadingUser) {
        return <div>Loading...</div>;
    }

    // Group membership check — user must belong to at least one required group
    if (requireGroups) {
        const hasRequiredGroup = user && (
            user.is_superuser ||
            requireGroups.some(g => user.groups?.includes(g))
        );
        if (!hasRequiredGroup) {
            return <Navigate to="/" />;
        }
    }

    return children;
}

export default ProtectedRoute;
