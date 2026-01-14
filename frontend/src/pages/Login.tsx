import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const next = params.get("next") || "/";

    return (
        <div className="max-w-xl mx-auto px-4 md:px-6 py-10 space-y-4">
            <h1 className="font-serif text-2xl font-bold text-kakurega-ink">ログイン</h1>
            <p className="text-sm text-kakurega-muted leading-relaxed">
                ここにログイン機能を実装予定です（今は未実装）。
            </p>

            <div className="bg-white/80 border border-black/10 rounded-2xl p-5 shadow-sm">
                <p className="text-xs text-kakurega-muted mb-4">
                    ログイン後は、元のページへ戻るようにします。
                </p>

                <div className="flex gap-3">
                    <button
                        onClick={() => navigate(next)}
                        className="px-5 py-3 bg-kakurega-green text-white rounded-xl text-xs font-bold shadow hover:bg-kakurega-dark-green transition-colors"
                    >
                        戻る
                    </button>
                    <button
                        onClick={() => navigate("/")}
                        className="px-5 py-3 bg-white border border-black/10 rounded-xl text-xs font-bold text-kakurega-ink hover:bg-black/5 transition-colors"
                    >
                        ホームへ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
