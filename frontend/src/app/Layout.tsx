import React, { useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Home as HomeIcon, Search as SearchIcon, Star, Info } from "lucide-react";

import ScrollToTopButton from "../components/ScrollToTopButton";
import EventDetailModal from "../components/EventDetailModal";
import Header from "../components/Header";
import Sidebar, { NavItem } from "../components/Sidebar";
import MobileSidebar from "../components/MobileSidebar";
import { useToast } from "../context/toast";

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

    const { showToast } = useToast();

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
            { path: "/guide", icon: <Info size={22} />, label: "ガイド" },
        ],
        []
    );

    const handleLoginClick = () => {
        const next = `${location.pathname}${location.search}`;
        navigate(`/login?next=${encodeURIComponent(next)}`);
        showToast({ type: "info", message: "ログインしてください。" });
    };

    return (
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
    );
};

export default Layout;
