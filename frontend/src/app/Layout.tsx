import React, { useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
    Home as HomeIcon,
    Search as SearchIcon,
    Star,
    Info,
} from "lucide-react";

import ToastHost, { ToastItem, ToastType } from "../components/ToastHost";
import ScrollToTopButton from "../components/ScrollToTopButton";
import EventDetailModal from "../components/EventDetailModal";
import Header from "../components/Header";
import Sidebar, { NavItem } from "../components/Sidebar";
import MobileSidebar from "../components/MobileSidebar";
import { ToastContext } from "../context/toast";

const Layout: React.FC<{
    children: React.ReactNode;
    events: any[];
    favIds: Set<string>;
    setFavIds: React.Dispatch<React.SetStateAction<Set<string>>>;
    eventsLoading: boolean;
}> = ({ children, events, favIds, setFavIds }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const detailId = searchParams.get("event_id");

    const [toast, setToast] = useState<ToastItem | null>(null);
    const toastTimerRef = useRef<number | null>(null);

    const pushToast = (
        message: string,
        type: ToastType = "info",
        action?: { label: string; onClick: () => void }
    ) => {
        if (toastTimerRef.current !== null) {
            window.clearTimeout(toastTimerRef.current);
            toastTimerRef.current = null;
        }

        setToast((prev) => {
            if (prev && prev.message === message && prev.type === type) {
                return {
                    ...prev,
                    actionLabel: action?.label,
                    onAction: action?.onClick,
                };
            }

            const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
            return {
                id,
                message,
                type,
                actionLabel: action?.label,
                onAction: action?.onClick,
            };
        });

        toastTimerRef.current = window.setTimeout(() => {
            setToast(null);
            toastTimerRef.current = null;
        }, 4000);
    };

    const closeToast = () => {
        if (toastTimerRef.current !== null) {
            window.clearTimeout(toastTimerRef.current);
            toastTimerRef.current = null;
        }
        setToast(null);
    };

    const closeDetail = () => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete("event_id");
        setSearchParams(newParams);
    };

    const navItems: NavItem[] = useMemo(
        () => [
            { path: "/", icon: <HomeIcon size={22} />, label: "ホーム" },
            { path: "/search", icon: <SearchIcon size={22} />, label: "検索" },
            { path: "/saved", icon: <Star size={22} />, label: "保存" },
            { path: "/about", icon: <Info size={22} />, label: "案内" },
        ],
        []
    );

    const handleLoginClick = () => {
        const next = `${location.pathname}${location.search}`;
        navigate(`/login?next=${encodeURIComponent(next)}`);
    };

    return (
        <ToastContext.Provider value={{ pushToast }}>
            <div className="min-h-screen bg-kakurega-paper bg-wafu-pattern text-kakurega-ink relative flex flex-col">
                {detailId && (
                    <EventDetailModal
                        eventId={detailId}
                        onClose={closeDetail}
                        events={events}
                        favIds={favIds}
                        setFavIds={setFavIds}
                    />
                )}

                <Header
                    onOpenSidebar={() => setIsSidebarOpen(true)}
                    onLoginClick={handleLoginClick}
                />

                <ToastHost toast={toast} onClose={closeToast} />

                <Sidebar items={navItems} activePath={location.pathname} />

                <MobileSidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                    items={navItems}
                    activePath={location.pathname}
                />

                <main className="flex-1 pt-[1.5cm] md:pl-[102px] overflow-x-hidden">
                    <div className="w-full animate-fade-in">{children}</div>
                </main>

                <ScrollToTopButton />
            </div>
        </ToastContext.Provider>
    );
};

export default Layout;
