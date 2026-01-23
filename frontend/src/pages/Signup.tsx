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

const SignupPage: React.FC = () => {
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
    const [password2, setPassword2] = useState("");

    const [showPw, setShowPw] = useState(false);
    const [showPw2, setShowPw2] = useState(false);

    const [agree, setAgree] = useState(false);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // メール欄直下に出す「既に登録済み」
    const [emailTaken, setEmailTaken] = useState<string | null>(null);

    const POLICY_PATH = "/privacy";
    const TERMS_PATH = "/terms";

    useEffect(() => {
        if (initializing) return;
        if (!user) return;
        navigate(next, { replace: true });
    }, [initializing, user, next, navigate]);

    const validate = (): boolean => {
        if (!email.trim()) {
            setError("メールアドレスを入力してください。");
            return false;
        }
        if (!password) {
            setError("パスワードを入力してください。");
            return false;
        }
        if (password.length < 6) {
            setError("パスワードは6文字以上にしてください。");
            return false;
        }
        if (password !== password2) {
            setError("確認用パスワードが一致しません。");
            return false;
        }
        if (!agree) {
            setError("利用規約・プライバシーポリシーへの同意が必要です。");
            return false;
        }
        return true;
    };

    const isAlreadyRegisteredEmailError = (e: any): boolean => {
        const msg = String(e?.message ?? "").toLowerCase();
        return msg.includes("already registered") || msg.includes("user already registered");
    };

    // ★重要：Supabaseの返り方によっては error にならず成功扱いで返る（ただし identities が空など）
    const looksLikeEmailAlreadyExists = (data: any): boolean => {
        const identities = data?.user?.identities;
        // 既存ユーザーの場合に identities: [] が返るパターンがある
        if (Array.isArray(identities) && identities.length === 0) return true;

        return false;
    };

    const showEmailTakenUI = () => {
        setEmailTaken("このメールアドレスは既に登録済みです。ログイン画面からログインしてください。");
        setMessage(null);
        setError(null);
    };

    const handleSignUp = async () => {
        if (user) {
            navigate(next, { replace: true });
            return;
        }

        setLoading(true);
        setError(null);
        setMessage(null);
        setEmailTaken(null);

        try {
            if (!validate()) return;

            const { data, error } = await withTimeout(
                supabase.auth.signUp({
                    email: email.trim(),
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/#/auth/callback?next=${encodeURIComponent(next)}`,
                    },
                }),
                8000,
                "signUp"
            );

            // 1) エラーで「登録済み」が返ってくる環境
            if (error) {
                if (isAlreadyRegisteredEmailError(error)) {
                    showEmailTakenUI();
                    return;
                }
                throw error;
            }

            // 2) エラーにならず成功扱いだが「既に存在する」っぽい返り（重要）
            if (looksLikeEmailAlreadyExists(data)) {
                showEmailTakenUI();
                return;
            }

            // Email確認ONだと session が null のことがある（通常の新規登録）
            if (data?.session) {
                ensureProfile()
                    .then(() => console.log("ensureProfile OK (SignUp)"))
                    .catch((e) => console.error("ensureProfile failed (SignUp)", e));

                navigate(next, { replace: true });
                return;
            }

            // ★ここに来たら「新規登録として確認メール送信」扱い
            setMessage("確認メールを送信しました。メール内のリンクから登録を完了してください。");
        } catch (e: any) {
            console.error(e);

            // catch 側でも一応拾う（エラー型が違う場合）
            if (isAlreadyRegisteredEmailError(e)) {
                showEmailTakenUI();
                return;
            }

            setError(e?.message ?? "エラーが発生しました。");
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;
        void handleSignUp();
    };

    return (
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-10">
            <h1 className="text-center font-serif text-2xl font-bold text-kakurega-ink mb-8">
                新規会員登録
            </h1>

            <div className="bg-white/80 border border-black/10 rounded-3xl shadow-sm overflow-hidden">
                <div className="p-6 md:p-10 space-y-4">
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs text-kakurega-muted">メールアドレス</label>
                            <input
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setEmailTaken(null);
                                    setError(null);
                                    setMessage(null);
                                }}
                                type="email"
                                autoComplete="email"
                                className="w-full rounded-2xl border border-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-kakurega-green/40 bg-white"
                                placeholder="you@example.com"
                                disabled={loading || (!!user && !initializing)}
                            />

                            {/* メール入力欄の直下に表示 */}
                            {emailTaken && (
                                <div className="text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl px-4 py-3">
                                    {emailTaken}
                                    <div className="mt-2">
                                        <button
                                            type="button"
                                            onClick={() => navigate(`/login?next=${encodeURIComponent(next)}`)}
                                            className="text-kakurega-green font-bold hover:underline"
                                            disabled={loading}
                                        >
                                            ログイン画面へ
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs text-kakurega-muted">パスワード</label>
                            <div className="relative">
                                <input
                                    type={showPw ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="new-password"
                                    className="w-full rounded-2xl border border-black/10 px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-kakurega-green/40 bg-white"
                                    placeholder="••••••••"
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
                            <div className="text-[11px] text-kakurega-muted leading-relaxed">
                                ※ 6文字以上推奨。推測されやすいものは避けてください。
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs text-kakurega-muted">確認用パスワード</label>
                            <div className="relative">
                                <input
                                    type={showPw2 ? "text" : "password"}
                                    value={password2}
                                    onChange={(e) => setPassword2(e.target.value)}
                                    autoComplete="new-password"
                                    className="w-full rounded-2xl border border-black/10 px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-kakurega-green/40 bg-white"
                                    placeholder="••••••••"
                                    disabled={loading || (!!user && !initializing)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw2((v) => !v)}
                                    className="absolute inset-y-0 right-3 flex items-center text-kakurega-muted hover:text-kakurega-ink transition-colors"
                                    aria-label={showPw2 ? "パスワードを隠す" : "パスワードを表示"}
                                    disabled={loading}
                                >
                                    {showPw2 ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-black/10 bg-white px-4 py-3">
                            <label className="flex items-start gap-3 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    className="mt-1 h-4 w-4"
                                    checked={agree}
                                    onChange={(e) => setAgree(e.target.checked)}
                                    disabled={loading}
                                />
                                <span className="text-xs text-kakurega-ink leading-relaxed">
                                    <span className="font-bold">利用規約</span> と{" "}
                                    <span className="font-bold">プライバシーポリシー</span> に同意します。{" "}
                                    <span className="text-kakurega-muted">
                                        （
                                        <button
                                            type="button"
                                            onClick={() => navigate(TERMS_PATH)}
                                            className="text-kakurega-green font-bold hover:underline"
                                            disabled={loading}
                                        >
                                            利用規約
                                        </button>
                                        ・
                                        <button
                                            type="button"
                                            onClick={() => navigate(POLICY_PATH)}
                                            className="text-kakurega-green font-bold hover:underline"
                                            disabled={loading}
                                        >
                                            プライバシーポリシー
                                        </button>
                                        ）
                                    </span>
                                </span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="w-full mt-2 px-5 py-4 bg-amber-500 text-white rounded-2xl text-sm font-bold shadow hover:bg-amber-600 transition-colors disabled:opacity-60"
                            disabled={loading || !agree || !!emailTaken}
                        >
                            {loading ? "処理中..." : "新規会員登録（無料）"}
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
            </div>

            <div className="mt-6 flex gap-3 justify-center">
                <button
                    onClick={() => navigate(`/login?next=${encodeURIComponent(next)}`)}
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

export default SignupPage;