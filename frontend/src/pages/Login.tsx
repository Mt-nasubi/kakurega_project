import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { ensureProfile } from "../lib/profile";
import { useAuth } from "../lib/auth";
import { Eye, EyeOff } from "lucide-react";

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

    // UIだけ（必要なら後で localStorage と連携）
    const [remember, setRemember] = useState(false);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // リンク先（必要なら差し替え）
    const POLICY_PATH = "/privacy";
    const TERMS_PATH = "/terms";

    // ログイン済みなら戻す
    useEffect(() => {
        if (initializing) return;
        if (!user) return;
        navigate(next, { replace: true });
    }, [initializing, user, next, navigate]);

    const validateCommon = (): boolean => {
        if (!email.trim()) {
            setError("メールアドレスを入力してください。");
            return false;
        }
        if (!password) {
            setError("パスワードを入力してください。");
            return false;
        }
        return true;
    };

    const handleSignIn = async () => {
        if (user) {
            navigate(next, { replace: true });
            return;
        }
    
        setLoading(true);
        setError(null);
        setMessage(null);
    
        try {
            if (!validateCommon()) return;
        
            const { data, error } = await withTimeout(
                supabase.auth.signInWithPassword({
                    email: email.trim(),
                    password,
                }),
                8000,
                "signInWithPassword"
            );
        
            if (error) {
                if (error.message === "Invalid login credentials") {
                    throw new Error("メールアドレスまたはパスワードが違います");
                } else if (error.message === "Email not confirmed") {
                    throw new Error("メール認証が完了していません");
                } else {
                    throw new Error("ログインに失敗しました");
                }
            }
        
            if (!data.session) {
                setError("ログインに失敗しました。もう一度お試しください。");
                return;
            }
        
            ensureProfile()
                .then(() => console.log("ensureProfile OK (Login)"))
                .catch((e) => console.error("ensureProfile failed (Login)", e));
        
            navigate(next, { replace: true });
        } catch (e: any) {
            console.error(e);
            setError(e?.message ?? "エラーが発生しました。");
        } finally {
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

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;
        void handleSignIn();
    };

    return (
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-10">
            <h1 className="text-center font-serif text-2xl font-bold text-kakurega-ink mb-8">
                ログイン
            </h1>

            <div className="bg-white/80 border border-black/10 rounded-3xl shadow-sm overflow-hidden">
                <div className="grid md:grid-cols-2">
                    {/* Left */}
                    <div className="p-6 md:p-12 bg-black/[0.03]">
                        <div className="text-center text-lg font-bold text-kakurega-ink mb-6">
                            会員の方
                        </div>

                        <form onSubmit={onSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <input
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    type="email"
                                    autoComplete="email"
                                    className="w-full rounded-2xl border border-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-kakurega-green/40 bg-white"
                                    placeholder="メールアドレス"
                                    disabled={loading || (!!user && !initializing)}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="relative">
                                    <input
                                        type={showPw ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="current-password"
                                        className="w-full rounded-2xl border border-black/10 px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-kakurega-green/40 bg-white"
                                        placeholder="パスワード"
                                        disabled={loading || (!!user && !initializing)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPw((v) => !v)}
                                        className="absolute inset-y-0 right-3 flex items-center text-kakurega-muted hover:text-kakurega-ink transition-colors"
                                        aria-label={showPw ? "パスワードを隠す" : "パスワードを表示"}
                                        disabled={loading}
                                    >
                                        {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* remember */}
                            <label className="flex items-center gap-3 text-sm text-kakurega-ink select-none">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4"
                                    checked={remember}
                                    onChange={(e) => setRemember(e.target.checked)}
                                    disabled={loading}
                                />
                                メールアドレス、パスワードを記憶
                            </label>

                            <button
                                type="submit"
                                className="w-full mt-4 px-5 py-4 rounded-2xl text-sm font-bold shadow transition-colors disabled:opacity-60 bg-red-500 hover:bg-red-600 text-white"
                                disabled={loading}
                            >
                                {loading ? "処理中..." : "ログインする"}
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate(`/reset-password?next=${encodeURIComponent(next)}`)}
                                className="w-full text-sm text-red-600 font-bold hover:underline"
                                disabled={loading}
                            >
                                パスワードを忘れた方はこちらへ
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
                        </form>
                    </div>

                    {/* Right */}
                    <div className="p-6 md:p-12 bg-black/[0.02] border-t md:border-t-0 md:border-l border-black/10">
                        <div className="text-center text-lg font-bold text-kakurega-ink mb-6">
                            新規会員登録
                        </div>

                        <p className="text-sm text-kakurega-muted leading-relaxed text-center mb-8">
                            会員登録がお済みでない方はこちらからご登録ください。会員登録は無料です。
                        </p>

                        <button
                            type="button"
                            onClick={() => navigate(`/signup?next=${encodeURIComponent(next)}`)}
                            className="w-full px-5 py-4 rounded-2xl text-sm font-bold shadow transition-colors bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-60"
                            disabled={loading}
                        >
                            新規会員登録（無料）
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-center gap-3">
                <button
                    onClick={() => navigate(next)}
                    className="px-5 py-3 bg-white border border-black/10 rounded-xl text-xs font-bold text-kakurega-ink hover:bg-black/5 transition-colors disabled:opacity-60"
                    disabled={loading}
                    type="button"
                >
                    戻る
                </button>
                <button
                    onClick={() => navigate("/")}
                    className="px-5 py-3 bg-white border border-black/10 rounded-xl text-xs font-bold text-kakurega-ink hover:bg-black/5 transition-colors disabled:opacity-60"
                    disabled={loading}
                    type="button"
                >
                    ホームへ
                </button>
            </div>
        </div>
    );
};

export default LoginPage;
