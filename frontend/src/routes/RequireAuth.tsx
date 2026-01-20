import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth";

export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, initializing } = useAuth();
    const location = useLocation();

    if (initializing) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-10">
                <div className="text-sm text-kakurega-muted">読み込み中...</div>
            </div>
        );
    }

    if (!user) {
        const next = location.pathname + location.search;
        return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;
    }

    return <>{children}</>;
};
