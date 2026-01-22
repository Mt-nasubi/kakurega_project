import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { ensureProfile } from "../lib/profile";
import { useAuth } from "../lib/auth";

import { Eye, EyeOff } from "lucide-react";
import { SiLine } from "react-icons/si";

const withTimeout = async <T,>(p: Promise<T>, ms: number, label: string): Promise<T> => {
    return await Promise.race([
        p,
        new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`${label} timeout (${ms}ms)`)), ms)
        ),
    ]);
};

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, initializing } = useAuth();

    const next = useMemo(() => {
        const params = new URLSearchParams(location.search);
        const raw = params.get("next") || "/";
        return raw.startsWith("/") ? raw : "/";
    }, [location.search]);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // ★ 追加：ログイン済みならログイン画面に居続けない
    useEffect(() => {
        if (initializing) return;
        if (!user) return;
        navigate(next, { replace: true });
    }, [initializing, user, next, navigate]);

    const handleSignIn = async () => {
        // 既にログイン済みなら即遷移
        if (user) {
            navigate(next, { replace: true });
            return;
        }

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

            console.log("signIn start");

            const { data, error } = await withTimeout(
                supabase.auth.signInWithPassword({
                    email: email.trim(),
                    password,
                }),
                8000,
                "signInWithPassword"
            );

            console.log("signIn result", { hasSession: !!data.session, error });

            if (error) throw error;
            if (!data.session) {
                setError("ログインに失敗しました。もう一度お試しください。");
                return;
            }

            // profiles 作成は “待たない” でOK（遅くてもログイン自体は完了させる）
            ensureProfile()
                .then(() => console.log("ensureProfile OK (Login)"))
                .catch((e) => console.error("ensureProfile failed (Login)", e));

            navigate(next, { replace: true });
        } catch (e: any) {
            console.error("signIn catch", e);
            setError(e?.message ?? "エラーが発生しました。");
        } finally {
            console.log("signIn finally -> setLoading(false)");
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (!email.trim()) {
                setError("パスワード再設定のため、メールアドレスを入力してください。");
                return;
            }

            const { error } = await withTimeout(
                supabase.auth.resetPasswordForEmail(email.trim(), {
                    redirectTo: `${window.location.origin}/#/reset-password`,
                }),
                8000,
                "resetPasswordForEmail"
            );

            if (error) throw error;
            setMessage("再設定用メールを送信しました。受信箱をご確認ください。");
        } catch (e: any) {
            setError(e?.message ?? "エラーが発生しました。");
        } finally {
            setLoading(false);
        }
    };

    const handleLineLogin = async () => {
        setMessage(null);
        setError("LINEログインは準備中です（Auth0またはEdge Functionで接続します）。");
    };

    return (
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-10">
            <h1 className="text-center font-serif text-2xl font-bold text-kakurega-ink mb-8">
                ログイン
            </h1>

            <div className="bg-white/80 border border-black/10 rounded-3xl shadow-sm overflow-hidden">
                <div className="grid md:grid-cols-2">
                    {/* Left: Email */}
                    <div className="p-6 md:p-10 space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs text-kakurega-muted">メールアドレス</label>
                            <input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                type="email"
                                autoComplete="email"
                                className="w-full rounded-2xl border border-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-kakurega-green/40 bg-white"
                                placeholder="you@example.com"
                                disabled={loading || (!!user && !initializing)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs text-kakurega-muted">パスワード</label>

                            <div className="relative">
                                <input
                                    type={showPw ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                    className="
                                        w-full rounded-2xl border border-black/10
                                        px-4 py-3 pr-12
                                        outline-none
                                        focus:ring-2 focus:ring-kakurega-green/40
                                        bg-white
                                    "
                                    placeholder="••••••••"
                                    disabled={loading || (!!user && !initializing)}
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPw((v) => !v)}
                                    className="
                                        absolute inset-y-0 right-3
                                        flex items-center
                                        text-kakurega-muted
                                        hover:text-kakurega-ink
                                        transition-colors
                                    "
                                    aria-label={showPw ? "パスワードを隠す" : "パスワードを表示"}
                                    disabled={loading}
                                >
                                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                            <button
                                type="button"
                                onClick={handleResetPassword}
                                className="text-kakurega-green font-bold hover:underline"
                                disabled={loading}
                            >
                                パスワードを忘れた方（再設定）
                            </button>
                        </div>

                        <button
                            onClick={handleSignIn}
                            className="w-full mt-2 px-5 py-4 bg-kakurega-green text-white rounded-2xl text-sm font-bold shadow hover:bg-kakurega-dark-green transition-colors disabled:opacity-60"
                            disabled={loading}
                        >
                            {loading ? "処理中..." : "ログイン"}
                        </button>

                        {error && (
                            <div className="text-sm bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3">
                                {error}
                            </div>
                        )}
                        {message && (
                            <div className="text-sm bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl px-4 py-3">
                                {message}
                            </div>
                        )}
                    </div>

                    {/* Right: Social */}
                    <div className="p-6 md:p-10 border-t md:border-t-0 md:border-l border-black/10 bg-black/[0.02] space-y-4">
                        <button
                            onClick={handleLineLogin}
                            className="
                                w-full px-5 py-4
                                bg-[#06C755]
                                text-white
                                rounded-2xl
                                text-sm font-bold
                                shadow
                                hover:bg-[#05b34b]
                                transition-colors
                                flex items-center justify-center gap-3
                            "
                            disabled={loading}
                        >
                            <SiLine size={20} />
                            LINEでログイン
                        </button>

                        <div className="text-xs text-kakurega-muted leading-relaxed">
                            ※ LINEログインは Supabase単体では直接接続できないため、Auth0 または Edge Function を使って実装します。
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 flex gap-3 justify-center">
                <button
                    onClick={() => navigate(next)}
                    className="px-5 py-3 bg-white border border-black/10 rounded-xl text-xs font-bold text-kakurega-ink hover:bg-black/5 transition-colors disabled:opacity-60"
                    disabled={loading}
                >
                    戻る
                </button>
                <button
                    onClick={() => navigate("/")}
                    className="px-5 py-3 bg-white border border-black/10 rounded-xl text-xs font-bold text-kakurega-ink hover:bg-black/5 transition-colors disabled:opacity-60"
                    disabled={loading}
                >
                    ホームへ
                </button>
            </div>
        </div>
    );
};

export default LoginPage;
