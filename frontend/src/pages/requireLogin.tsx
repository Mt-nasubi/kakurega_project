import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Star } from "lucide-react";

const RequireLoginPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const params = new URLSearchParams(location.search);
    const next = params.get("next") || "/saved";

    return (
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 space-y-6">
            <div className="mb-6">
                <h1 className="font-serif text-2xl mb-1">保存したイベント</h1>
                <p className="text-xs text-kakurega-muted">この端末のブラウザに保存されています。</p>
            </div>

            <div className="text-center py-20 bg-white/50 rounded-2xl border border-dashed border-black/20">
                <Star size={48} className="mx-auto text-kakurega-muted/30 mb-4" />

                <p className="text-sm text-kakurega-muted mb-4">
                    お気に入り登録にはログインが必要です。
                </p>

                <button
                    onClick={() => navigate(`/login?next=${encodeURIComponent(next)}`)}
                    className="inline-block px-6 py-2 bg-kakurega-green text-white rounded-xl text-xs font-bold hover:bg-kakurega-dark-green transition-colors"
                >
                    ログインする
                </button>
            </div>
        </div>
    );
};

export default RequireLoginPage;