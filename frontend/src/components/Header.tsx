import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, User } from "lucide-react";
import KakuregaLogo from "./KakuregaLogo";
import MegaMenu from "./MegaMenu";
import { useAuth } from "../lib/auth";

type HeaderProps = {
    onOpenSidebar: () => void;
    onLoginClick: () => void;
};

const Header: React.FC<HeaderProps> = ({ onOpenSidebar, onLoginClick }) => {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const { user, profile } = useAuth();

    const displayLabel = profile?.display_name?.trim()
        ? profile.display_name
        : (user?.email ? user.email.split("@")[0] : "マイページ");

    const handleAccountClick = () => {
        if (user) {
            navigate("/mypage");
            return;
        }
        onLoginClick();
    };

    return (
        <header
            className="relative h-[1.5cm] flex items-center justify-between px-4
                       bg-gradient-to-b from-kakurega-green to-kakurega-dark-green
                       border-b border-black/10 fixed top-0 w-full z-50 shadow-md"
            onMouseLeave={() => setOpen(false)}
        >
            {/* 左 */}
            <div className="flex items-center gap-4">
                {/* モバイル用 */}
                <button
                    onClick={onOpenSidebar}
                    className="md:hidden flex flex-col items-center justify-center text-white"
                    aria-label="メニュー"
                    type="button"
                >
                    <Menu size={24} />
                    <span className="text-[10px] opacity-90">メニュー</span>
                </button>

                {/* PC：案内（メガメニュー） */}
                <div
                    className="
                        hidden md:flex
                        flex-col items-center justify-center
                        gap-[2px]
                        cursor-pointer select-none
                        text-white
                        px-2 py-1
                        rounded-md
                        hover:bg-white/10
                    "
                    onMouseEnter={() => setOpen(true)}
                    onFocus={() => setOpen(true)}
                    tabIndex={0}
                    aria-label="案内メニュー"
                >
                    {/* 三本線 */}
                    <Menu size={26} className="opacity-90" />

                    {/* ラベル */}
                    <span className="text-[10px] leading-none opacity-90">
                        メニュー
                    </span>
                </div>
            </div>

            {/* 中央ロゴ */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
                <Link to="/" className="flex items-center gap-3 group">
                    <KakuregaLogo className="w-9 h-9 text-[#fffdf6]" />
                    <span className="font-serif text-2xl font-bold text-[#fffdf6] tracking-widest">
                        隠れ家
                    </span>
                </Link>
            </div>

            {/* 右：ログイン or ユーザー名 */}
            <button
                onClick={handleAccountClick}
                className="flex flex-col items-center justify-center text-white"
                aria-label={user ? "マイページ" : "ログイン"}
                type="button"
            >
                <div className="w-[26px] h-[26px] bg-white/20 rounded-full flex items-center justify-center border border-white/40">
                    <User size={16} />
                </div>

                <span
                    className="text-[10px] opacity-90 max-w-[88px] truncate"
                    title={user ? displayLabel : "ログイン"}
                >
                    {user ? displayLabel : "ログイン"}
                </span>
            </button>

            {/* メガメニュー */}
            {open && <MegaMenu />}
        </header>
    );
};

export default Header;
