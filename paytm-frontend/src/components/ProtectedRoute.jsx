// components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/signin" replace />;
    }

    try {
        const decoded = jwtDecode(token);
        if (decoded.exp && Date.now() >= decoded.exp * 1000) {
            localStorage.clear();
            return <Navigate to="/signin" replace />;
        }
    } catch {
        localStorage.clear();
        return <Navigate to="/signin" replace />;
    }

    return children;
};