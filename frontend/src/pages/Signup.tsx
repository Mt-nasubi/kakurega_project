import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Eye, EyeOff } from "lucide-react";

const SignupPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const next = useMemo(() => {
        const params = new URLSearchParams(location.search);
        const raw = params.get("next") || "/";
        return raw.startsWith("/") ? raw : "/";
    }, [location.search]);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [showPw, setShowPw] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleSignup = async () => {
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (!email.trim()) {
                setError("メールアドレスを入力してください。");
                return;
            }
            if (!password) {
                setError("パスワードを入力してください。");
                return;
            }
            if (!displayName.trim()) {
                setError("表示名を入力してください。");
                return;
            }

            sessionStorage.setItem(
                "signup_display_name",
                displayName.trim()
            );

            const { data, error } = await supabase.auth.signUp({
                email: email.trim(),
                password,
                options: {
                    data: {
                        display_name: displayName.trim(),
                    },
                },
            });

            console.log("signUp data", data);
            console.log("signUp error", error);

            if (error) throw error;

            if (data.user && !data.session) {
                setMessage(
                    "確認メールを送信しました。メール内リンクから完了してください。"
                );
                return;
            }

            navigate(next, { replace: true });
        } catch (e: any) {
            setError(e?.message ?? "エラーが発生しました。");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto px-4 py-10">
            <h1 className="text-center font-serif text-2xl font-bold text-kakurega-ink mb-8">
                新規会員登録
            </h1>

            <div className="bg-white/80 border border-black/10 rounded-3xl shadow-sm p-6 space-y-4">
                {/* 表示名 */}
                <div className="space-y-2">
                    <label className="text-xs text-kakurega-muted">表示名</label>
                    <input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full rounded-2xl border px-4 py-3"
                        placeholder="山鳥 太一"
                        disabled={loading}
                    />
                </div>

                {/* メール */}
                <div className="space-y-2">
                    <label className="text-xs text-kakurega-muted">
                        メールアドレス
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-2xl border px-4 py-3"
                        placeholder="you@example.com"
                        disabled={loading}
                    />
                </div>

                {/* パスワード */}
                <div className="space-y-2">
                    <label className="text-xs text-kakurega-muted">
                        パスワード
                    </label>
                    <div className="relative">
                        <input
                            type={showPw ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-2xl border px-4 py-3 pr-12"
                            placeholder="••••••••"
                            disabled={loading}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPw(v => !v)}
                            className="absolute inset-y-0 right-3 flex items-center"
                        >
                            {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <button
                    onClick={handleSignup}
                    disabled={loading}
                    className="w-full py-3 bg-kakurega-green text-white rounded-2xl font-bold"
                >
                    {loading ? "処理中..." : "登録する"}
                </button>

                {error && <div className="text-red-600 text-sm">{error}</div>}
                {message && (
                    <div className="text-emerald-600 text-sm">{message}</div>
                )}

                <div className="text-center text-xs mt-4">
                    すでにアカウントをお持ちですか？
                    <button
                        className="ml-1 underline text-kakurega-green"
                        onClick={() =>
                            navigate(`/login?next=${encodeURIComponent(next)}`)
                        }
                    >
                        ログイン
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
