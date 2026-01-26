import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

function getQueryParam(search: string, key: string): string | null {
    const params = new URLSearchParams(search);
    const v = params.get(key);
    return v && v.trim() ? v.trim() : null;
}

const OrganizerLoginPage: React.FC = () => {
    const nav = useNavigate();
    const location = useLocation();

    const presetEmail = useMemo(() => getQueryParam(location.search, "email") ?? "", [location.search]);

    const [email, setEmail] = useState(presetEmail);
    const [password, setPassword] = useState("");

    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setEmail(presetEmail);
    }, [presetEmail]);

    const routeAfterLogin = async () => {
        // 主催者情報と規約同意が揃っているか確認
        const { data: userData, error: userErr } = await supabase.auth.getUser();
        if (userErr) throw userErr;

        const userId = userData.user?.id;
        if (!userId) {
            nav("/organizer/login", { replace: true });
            return;
        }

        const { data: op, error: opErr } = await supabase
            .from("organizer_profiles")
            .select("user_id")
            .eq("user_id", userId)
            .maybeSingle();

        if (opErr) throw opErr;

        const { data: ta, error: taErr } = await supabase
            .from("organizer_terms_acceptances")
            .select("user_id")
            .eq("user_id", userId)
            .maybeSingle();

        if (taErr) throw taErr;

        if (!op || !ta) {
            nav(`/organizer/signup?email=${encodeURIComponent(email.trim())}`, { replace: true });
            return;
        }

        nav("/organizer/dashboard", { replace: true });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!email.trim() || !password) {
            setError("メールとパスワードを入力してください。");
            return;
        }

        setBusy(true);
        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password,
            });
            if (signInError) throw signInError;

            await routeAfterLogin();
        } catch (err: any) {
            setError(err?.message ?? "ログインに失敗しました。");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div style={{ maxWidth: 520, margin: "0 auto", padding: 24 }}>
            <h1 style={{ fontSize: 26, marginBottom: 16 }}>主催者ログイン</h1>

            {error && (
                <div style={{ background: "#ffecec", border: "1px solid #f5b5b5", padding: 12, borderRadius: 8, marginBottom: 12 }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
                <label style={{ display: "grid", gap: 6 }}>
                    <span>メール</span>
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
                        autoComplete="email"
                    />
                </label>

                <label style={{ display: "grid", gap: 6 }}>
                    <span>パスワード</span>
                    <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
                        autoComplete="current-password"
                    />
                </label>

                <button
                    type="submit"
                    disabled={busy}
                    style={{
                        padding: "12px 14px",
                        borderRadius: 10,
                        border: "1px solid #111",
                        background: busy ? "#ddd" : "#111",
                        color: busy ? "#333" : "#fff",
                        cursor: busy ? "not-allowed" : "pointer",
                    }}
                >
                    {busy ? "ログイン中..." : "ログイン"}
                </button>

                <div style={{ display: "flex", gap: 12, opacity: 0.85 }}>
                    <Link to="/organizer/signup" style={{ textDecoration: "underline" }}>
                        主催者登録
                    </Link>
                    <Link to="/organizer/terms" style={{ textDecoration: "underline" }}>
                        規約
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default OrganizerLoginPage;
