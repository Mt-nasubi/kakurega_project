import React from "react";
import { Link } from "react-router-dom";

export type NavItem = {
    path: string;
    label: string;
    icon: React.ReactNode;
};

type SidebarProps = {
    items: NavItem[];
    activePath: string;
};

const Sidebar: React.FC<SidebarProps> = ({ items, activePath }) => {
    return (
        <nav className="hidden md:flex flex-col fixed top-[1.5cm] left-0 w-[102px] h-[calc(100vh-1.5cm)] bg-[#f8f1e3]/95 border-r border-black/10 backdrop-blur-sm p-3 gap-3 z-40 shadow-lg">
            {items.map((item) => {
                const isActive = activePath === item.path;

                return (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border transition-all duration-200
                            ${
                                isActive
                                    ? "border-kakurega-green/50 bg-white shadow-[0_0_0_3px_rgba(14,107,42,0.12),0_8px_16px_rgba(0,0,0,0.08)] scale-105"
                                    : "border-black/10 bg-white/80 hover:border-kakurega-green/30 shadow-sm hover:shadow-md"
                            }`}
                    >
                        <div className={`${isActive ? "text-kakurega-green" : "text-kakurega-ink"}`}>
                            {item.icon}
                        </div>

                        <span className="text-[11px] font-medium opacity-80">
                            {item.label}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
};

export default Sidebar;
