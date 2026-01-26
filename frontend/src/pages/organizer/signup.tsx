import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

const TERMS_VERSION = "2026-01-26";

type OrganizerProfileInput = {
    orgName: string;
    repName: string;
    contactEmail: string;
    phone: string;
    address: string;
};

function getQueryParam(search: string, key: string): string | null {
    const params = new URLSearchParams(search);
    const v = params.get(key);
    return v && v.trim() ? v.trim() : null;
}

const OrganizerSignupPage: React.FC = () => {
    const nav = useNavigate();
    const location = useLocation();

    const presetEmail = useMemo(() => getQueryParam(location.search, "email") ?? "", [location.search]);

    const [loginEmail, setLoginEmail] = useState(presetEmail);
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");

    const [profile, setProfile] = useState<OrganizerProfileInput>({
        orgName: "",
        repName: "",
        contactEmail: presetEmail,
        phone: "",
        address: "",
    });

    const [agree, setAgree] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>(null);

    const validate = (): string | null => {
        if (!loginEmail.trim()) return "ログイン用メールアドレスを入力してください。";
        if (!password) return "パスワードを入力してください。";
        if (password.length < 8) return "パスワードは8文字以上を推奨します。";
        if (password !== password2) return "パスワード（確認）が一致しません。";

        if (!profile.orgName.trim()) return "団体名を入力してください。";
        if (!profile.repName.trim()) return "代表者名を入力してください。";
        if (!profile.contactEmail.trim()) return "連絡用メールを入力してください。";
        if (!profile.phone.trim()) return "電話番号を入力してください。";
        if (!profile.address.trim()) return "住所を入力してください。";

        if (!agree) return "規約への同意が必要です。";
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setInfo(null);

        const v = validate();
        if (v) {
            setError(v);
            return;
        }

        setBusy(true);
        try {
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email: loginEmail.trim(),
                password,
            });
            if (signUpError) throw signUpError;

            const userId = signUpData.user?.id;
            if (!userId) {
                throw new Error("ユーザー作成に失敗しました（user id が取得できません）。");
            }

            // サイト設定が「メール確認必須」の場合、session が null になることがあります。
            // その場合はRLSでINSERTできないので、ログイン後に登録を完了させる導線にします。
            const session = signUpData.session;
            if (!session) {
                setInfo(
                    "確認メールを送信しました。メール認証後にログインし、主催者登録を完了してください。"
                );
                nav(`/organizer/login?email=${encodeURIComponent(loginEmail.trim())}`, { replace: true });
                return;
            }

            // 規約同意
            const { error: termsError } = await supabase
                .from("organizer_terms_acceptances")
                .upsert(
                    {
                        user_id: userId,
                        terms_version: TERMS_VERSION,
                        accepted_at: new Date().toISOString(),
                    },
                    { onConflict: "user_id" }
                );

            if (termsError) throw termsError;

            // 必要個人情報
            const { error: profileError } = await supabase
                .from("organizer_profiles")
                .upsert(
                    {
                        user_id: userId,
                        org_name: profile.orgName.trim(),
                        rep_name: profile.repName.trim(),
                        email: profile.contactEmail.trim(),
                        phone: profile.phone.trim(),
                        address: profile.address.trim(),
                    },
                    { onConflict: "user_id" }
                );

            if (profileError) throw profileError;

            nav("/organizer/dashboard", { replace: true });
        } catch (err: any) {
            setError(err?.message ?? "登録に失敗しました。");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
            <h1 style={{ fontSize: 26, marginBottom: 16 }}>主催者登録</h1>

            {error && (
                <div style={{ background: "#ffecec", border: "1px solid #f5b5b5", padding: 12, borderRadius: 8, marginBottom: 12 }}>
                    {error}
                </div>
            )}
            {info && (
                <div style={{ background: "#eef7ff", border: "1px solid #b7d7ff", padding: 12, borderRadius: 8, marginBottom: 12 }}>
                    {info}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
                <section style={{ border: "1px solid #e5e5e5", borderRadius: 12, padding: 16 }}>
                    <h2 style={{ fontSize: 18, marginBottom: 12 }}>ログイン情報</h2>

                    <label style={{ display: "grid", gap: 6 }}>
                        <span>ログイン用メール</span>
                        <input
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            type="email"
                            placeholder="example@example.com"
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
                            placeholder="8文字以上推奨"
                            style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
                            autoComplete="new-password"
                        />
                    </label>

                    <label style={{ display: "grid", gap: 6 }}>
                        <span>パスワード（確認）</span>
                        <input
                            value={password2}
                            onChange={(e) => setPassword2(e.target.value)}
                            type="password"
                            style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
                            autoComplete="new-password"
                        />
                    </label>
                </section>

                <section style={{ border: "1px solid #e5e5e5", borderRadius: 12, padding: 16 }}>
                    <h2 style={{ fontSize: 18, marginBottom: 12 }}>主催者の必要個人情報</h2>

                    <label style={{ display: "grid", gap: 6 }}>
                        <span>団体名</span>
                        <input
                            value={profile.orgName}
                            onChange={(e) => setProfile((p) => ({ ...p, orgName: e.target.value }))}
                            type="text"
                            style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
                        />
                    </label>

                    <label style={{ display: "grid", gap: 6 }}>
                        <span>代表者名</span>
                        <input
                            value={profile.repName}
                            onChange={(e) => setProfile((p) => ({ ...p, repName: e.target.value }))}
                            type="text"
                            style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
                        />
                    </label>

                    <label style={{ display: "grid", gap: 6 }}>
                        <span>メール（連絡用）</span>
                        <input
                            value={profile.contactEmail}
                            onChange={(e) => setProfile((p) => ({ ...p, contactEmail: e.target.value }))}
                            type="email"
                            style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
                        />
                    </label>

                    <label style={{ display: "grid", gap: 6 }}>
                        <span>電話番号</span>
                        <input
                            value={profile.phone}
                            onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                            type="tel"
                            style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
                        />
                    </label>

                    <label style={{ display: "grid", gap: 6 }}>
                        <span>住所</span>
                        <input
                            value={profile.address}
                            onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))}
                            type="text"
                            style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
                        />
                    </label>
                </section>

                <section style={{ border: "1px solid #e5e5e5", borderRadius: 12, padding: 16 }}>
                    <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <input
                            type="checkbox"
                            checked={agree}
                            onChange={(e) => setAgree(e.target.checked)}
                        />
                        <span>
                            <Link to="/organizer/terms" target="_blank" rel="noreferrer" style={{ textDecoration: "underline" }}>
                                主催者向け利用規約
                            </Link>
                            に同意します（必須）
                        </span>
                    </label>
                </section>

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
                    {busy ? "登録中..." : "主催者登録する"}
                </button>

                <div style={{ display: "flex", gap: 12, opacity: 0.85 }}>
                    <Link to="/organizer/login" style={{ textDecoration: "underline" }}>
                        すでにアカウントがある（ログイン）
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default OrganizerSignupPage;
