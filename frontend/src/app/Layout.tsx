import React, { useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
    Menu,
    Home as HomeIcon,
    Search as SearchIcon,
    Star,
    MapPin,
    User,
    Info,
    X,
    ArrowUp,
} from "lucide-react";

import ToastHost, { ToastItem, ToastType } from "../components/ToastHost";
import ScrollToTopButton from "../components/ScrollToTopButton";
import EventDetailModal from "../components/EventDetailModal";
import { ToastContext } from "../context/toast";

const KakuregaLogo: React.FC<{ className?: string }> = ({ className }) => (
    <svg
        viewBox="0 0 100 100"
        className={className}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Kakurega Logo"
    >
        <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="4"
            className="opacity-90"
        />
        <path
            d="M22 46 Q 50 18 78 46"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M36 46 V 74 H 64 V 46"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinejoin="round"
        />
        <path d="M50 46 V 74" stroke="currentColor" strokeWidth="2.5" />
        <path d="M36 60 H 64" stroke="currentColor" strokeWidth="2.5" />
    </svg>
);

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

    const navItems = useMemo(
        () => [
            { path: "/", icon: <HomeIcon size={22} />, label: "ホーム" },
            { path: "/search", icon: <SearchIcon size={22} />, label: "検索" },
            { path: "/saved", icon: <Star size={22} />, label: "保存" },
            { path: "/about", icon: <Info size={22} />, label: "企業" },
        ],
        []
    );

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

                <header className="h-[1.5cm] flex items-center justify-between px-4 bg-gradient-to-b from-kakurega-green to-kakurega-dark-green border-b border-black/10 fixed top-0 w-full z-50 shadow-md">
                    <div className="flex items-center">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="md:hidden flex flex-col items-center justify-center text-white space-y-[2px]"
                            aria-label="メニュー"
                        >
                            <Menu size={24} />
                            <span className="text-[10px] opacity-90">メニュー</span>
                        </button>
                    </div>

                    <div className="absolute left-1/2 transform -translate-x-1/2">
                        <Link to="/" className="flex items-center gap-3 group">
                            <KakuregaLogo className="w-9 h-9 text-[#fffdf6] drop-shadow-md group-hover:scale-105 transition-transform duration-300" />
                            <span className="font-serif text-2xl font-bold text-[#fffdf6] tracking-widest drop-shadow-md group-hover:opacity-90 transition-opacity">
                                隠れ家
                            </span>
                        </Link>
                    </div>

                    <button
                        onClick={() => {
                            const next = `${location.pathname}${location.search}`;
                            navigate(`/login?next=${encodeURIComponent(next)}`);
                        }}
                        className="flex flex-col items-center justify-center text-white space-y-[2px]"
                        aria-label="ログイン"
                    >
                        <div className="w-[26px] h-[26px] bg-white/20 rounded-full flex items-center justify-center border border-white/40">
                            <User size={16} className="text-white" />
                        </div>
                        <span className="text-[10px] opacity-90">ログイン</span>
                    </button>
                </header>

                <ToastHost toast={toast} onClose={closeToast} />

                <nav className="hidden md:flex flex-col fixed top-[1.5cm] left-0 w-[102px] h-[calc(100vh-1.5cm)] bg-[#f8f1e3]/95 border-r border-black/10 backdrop-blur-sm p-3 gap-3 z-40 shadow-lg">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border transition-all duration-200
                                ${
                                    location.pathname === item.path
                                        ? "border-kakurega-green/50 bg-white shadow-[0_0_0_3px_rgba(14,107,42,0.12),0_8px_16px_rgba(0,0,0,0.08)] scale-105"
                                        : "border-black/10 bg-white/80 hover:border-kakurega-green/30 shadow-sm hover:shadow-md"
                                }`}
                        >
                            <div
                                className={`${
                                    location.pathname === item.path
                                        ? "text-kakurega-green"
                                        : "text-kakurega-ink"
                                }`}
                            >
                                {item.icon}
                            </div>
                            <span className="text-[11px] font-medium opacity-80">
                                {item.label}
                            </span>
                        </Link>
                    ))}
                </nav>

                {isSidebarOpen && (
                    <div className="fixed inset-0 z-[60] md:hidden">
                        <div
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setIsSidebarOpen(false)}
                        />
                        <nav className="absolute left-0 top-0 bottom-0 w-64 bg-[#f8f1e3] shadow-2xl p-6 flex flex-col gap-6 animate-slide-in">
                            <div className="flex justify-between items-center border-b border-black/10 pb-4">
                                <span className="font-serif text-xl font-bold text-kakurega-green">
                                    メニュー
                                </span>
                                <button
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="text-kakurega-muted"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="flex flex-col gap-2">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setIsSidebarOpen(false)}
                                        className={`flex items-center gap-4 p-3 rounded-xl transition-colors
                                            ${
                                                location.pathname === item.path
                                                    ? "bg-kakurega-green text-white shadow-md"
                                                    : "hover:bg-black/5 text-kakurega-ink"
                                            }`}
                                    >
                                        {item.icon}
                                        <span className="text-sm font-medium">{item.label}</span>
                                    </Link>
                                ))}
                            </div>
                        </nav>
                    </div>
                )}

                <main className="flex-1 pt-[1.5cm] md:pl-[102px] overflow-x-hidden">
                    <div className="w-full animate-fade-in">{children}</div>
                </main>

                <ScrollToTopButton />
            </div>
        </ToastContext.Provider>
    );
};

export default Layout;
