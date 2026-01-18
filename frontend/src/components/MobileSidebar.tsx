import React from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import type { NavItem } from "./Sidebar";

type MobileSidebarProps = {
    isOpen: boolean;
    onClose: () => void;
    items: NavItem[];
    activePath: string;
};

const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose, items, activePath }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] md:hidden">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            <nav className="absolute left-0 top-0 bottom-0 w-64 bg-[#f8f1e3] shadow-2xl p-6 flex flex-col gap-6 animate-slide-in">
                <div className="flex justify-between items-center border-b border-black/10 pb-4">
                    <span className="font-serif text-xl font-bold text-kakurega-green">
                        メニュー
                    </span>

                    <button onClick={onClose} className="text-kakurega-muted" aria-label="閉じる">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex flex-col gap-2">
                    {items.map((item) => {
                        const isActive = activePath === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={onClose}
                                className={`flex items-center gap-4 p-3 rounded-xl transition-colors
                                    ${
                                        isActive
                                            ? "bg-kakurega-green text-white shadow-md"
                                            : "hover:bg-black/5 text-kakurega-ink"
                                    }`}
                            >
                                {item.icon}
                                <span className="text-sm font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
};

export default MobileSidebar;
