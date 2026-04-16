import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "../lib/supabase";

type Mode = "request" | "update";

const withTimeout = async <T,>(p: Promise<T>, ms: number, label: string): Promise<T> => {
    return await Promise.race([
        p,
        new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`${label} timeout (${ms}ms)`)), ms)
        ),
    ]);
};

const ResetPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const next = useMemo(() => {
        const params = new URLSearchParams(location.search);
        const raw = params.get("next") || "/";
        return raw.startsWith("/") ? raw : "/";
    }, [location.search]);

    const [mode, setMode] = useState<Mode>("request");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [checkingRecovery, setCheckingRecovery] = useState(true);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        const checkRecoverySession = async () => {
            try {
                const hash = window.location.hash;
                const isRecoveryLink =
                    hash.includes("type=recovery") ||
                    hash.includes("access_token=") ||
                    hash.includes("refresh_token=");

                const { data } = await supabase.auth.getSession();
                const hasSession = !!data.session;

                if (!mounted) return;

                if (isRecoveryLink || hasSession) {
                    setMode("update");
                } else {
                    setMode("request");
                }
            } catch (e) {
                console.error("checkRecoverySession failed", e);
                if (!mounted) return;
                setMode("request");
            } finally {
                if (mounted) {
                    setCheckingRecovery(false);
                }
            }
        };

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event) => {
            if (event === "PASSWORD_RECOVERY") {
                setMode("update");
                setCheckingRecovery(false);
                setError(null);
                setMessage("新しいパスワードを入力してください。");
            }
        });

        void checkRecoverySession();

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const handleSendResetEmail = async () => {
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (!email.trim()) {
                setError("メールアドレスを入力してください。");
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
            console.error(e);
            setError(e?.message ?? "再設定メールの送信に失敗しました。");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async () => {
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (!password) {
                setError("新しいパスワードを入力してください。");
                return;
            }

            if (password.length < 8) {
                setError("パスワードは8文字以上で入力してください。");
                return;
            }

            if (password !== confirmPassword) {
                setError("確認用パスワードが一致しません。");
                return;
            }

            const { error } = await withTimeout(
                supabase.auth.updateUser({ password }),
                8000,
                "updateUser"
            );

            if (error) throw error;

            setMessage("パスワードを再設定しました。ログイン画面へ移動してください。");
            setPassword("");
            setConfirmPassword("");
        } catch (e: any) {
            console.error(e);
            setError(e?.message ?? "パスワードの再設定に失敗しました。");
        } finally {
            setLoading(false);
        }
    };

    const handleRequestSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;
        void handleSendResetEmail();
    };

    const handleUpdateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;
        void handleUpdatePassword();
    };

    return (
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-10">
            <h1 className="text-center font-serif text-2xl font-bold text-kakurega-ink mb-8">
                パスワード再設定
            </h1>

            <div className="bg-white/80 border border-black/10 rounded-3xl shadow-sm overflow-hidden">
                <div className="p-6 md:p-10 space-y-6">
                    {checkingRecovery ? (
                        <p className="text-sm text-kakurega-muted leading-relaxed text-center">
                            認証状態を確認しています...
                        </p>
                    ) : mode === "request" ? (
                        <>
                            <div className="space-y-2 text-center">
                                <p className="text-base font-bold text-kakurega-ink">
                                    再設定メールを送信
                                </p>
                                <p className="text-sm text-kakurega-muted leading-relaxed">
                                    登録済みのメールアドレスを入力すると、パスワード再設定用のメールを送信します。
                                </p>
                            </div>

                            <form onSubmit={handleRequestSubmit} className="space-y-4 max-w-xl mx-auto">
                                <input
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    type="email"
                                    autoComplete="email"
                                    className="w-full rounded-2xl border border-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-kakurega-green/40 bg-white"
                                    placeholder="メールアドレス"
                                    disabled={loading}
                                />

                                <button
                                    type="submit"
                                    className="w-full px-5 py-4 rounded-2xl text-sm font-bold shadow transition-colors bg-red-500 hover:bg-red-600 text-white disabled:opacity-60"
                                    disabled={loading}
                                >
                                    {loading ? "送信中..." : "再設定メールを送信する"}
                                </button>
                            </form>
                        </>
                    ) : (
                        <>
                            <div className="space-y-2 text-center">
                                <p className="text-base font-bold text-kakurega-ink">
                                    新しいパスワードを設定
                                </p>
                                <p className="text-sm text-kakurega-muted leading-relaxed">
                                    メール内のリンクからアクセスした場合、この画面で新しいパスワードを設定できます。
                                </p>
                            </div>

                            <form onSubmit={handleUpdateSubmit} className="space-y-4 max-w-xl mx-auto">
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="new-password"
                                        className="w-full rounded-2xl border border-black/10 px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-kakurega-green/40 bg-white"
                                        placeholder="新しいパスワード（8文字以上）"
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        className="absolute inset-y-0 right-3 flex items-center text-kakurega-muted hover:text-kakurega-ink transition-colors"
                                        aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示"}
                                        disabled={loading}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        autoComplete="new-password"
                                        className="w-full rounded-2xl border border-black/10 px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-kakurega-green/40 bg-white"
                                        placeholder="新しいパスワード（確認用）"
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword((v) => !v)}
                                        className="absolute inset-y-0 right-3 flex items-center text-kakurega-muted hover:text-kakurega-ink transition-colors"
                                        aria-label={showConfirmPassword ? "確認用パスワードを隠す" : "確認用パスワードを表示"}
                                        disabled={loading}
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full px-5 py-4 rounded-2xl text-sm font-bold shadow transition-colors bg-red-500 hover:bg-red-600 text-white disabled:opacity-60"
                                    disabled={loading}
                                >
                                    {loading ? "更新中..." : "新しいパスワードに更新する"}
                                </button>
                            </form>
                        </>
                    )}

                    {error && (
                        <div className="max-w-xl mx-auto text-sm bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="max-w-xl mx-auto text-sm bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl px-4 py-3">
                            {message}
                        </div>
                    )}

                    <div className="pt-2 flex flex-wrap justify-center gap-3">
                        <button
                            onClick={() => navigate(`/login?next=${encodeURIComponent(next)}`)}
                            className="px-5 py-3 bg-white border border-black/10 rounded-xl text-xs font-bold text-kakurega-ink hover:bg-black/5 transition-colors disabled:opacity-60"
                            disabled={loading}
                            type="button"
                        >
                            ログイン画面へ
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
            </div>
        </div>
    );
};

export default ResetPasswordPage;
