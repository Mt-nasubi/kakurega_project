import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { updateMyProfile } from "../lib/profile";
import { useAuth } from "../lib/auth";
import { useToast } from "../context/toast";

const MyPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, profile, refreshProfile, signOut, initializing } = useAuth();
    const { showToast } = useToast();

    const triedRefetchRef = useRef(false);

    const fallbackName = useMemo(() => {
        const metaName = (user?.user_metadata?.display_name as string | undefined) ?? "";
        if (metaName.trim()) return metaName.trim();
        const email = user?.email ?? "";
        return email ? email.split("@")[0] : "";
    }, [user]);

    const initialName = useMemo(() => {
        const name = (profile?.display_name ?? "").trim();
        return name || fallbackName || "";
    }, [profile?.display_name, fallbackName]);

    const initialNotify = useMemo(() => {
        return profile?.notify_enabled ?? true;
    }, [profile?.notify_enabled]);

    const [displayName, setDisplayName] = useState("");
    const [notifyEnabled, setNotifyEnabled] = useState(true);
    const [newEmail, setNewEmail] = useState("");

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    console.log("[mypage] state", { initializing, hasUser: !!user, hasProfile: !!profile });

    useEffect(() => {
        setDisplayName(initialName);
        setNotifyEnabled(initialNotify);
        setNewEmail(user?.email ?? "");
    }, [initialName, initialNotify, user?.email]);

    useEffect(() => {
        if (!user) return;
        if (profile) return;
        if (initializing) return;
        if (triedRefetchRef.current) return;

        triedRefetchRef.current = true;
        refreshProfile().catch((e) => console.error("refreshProfile (fallback) failed", e));
    }, [user, profile, initializing, refreshProfile]);

    const saveProfile = async () => {
        if (!user) return;

        setSaving(true);
        setError(null);
        setMessage(null);

        try {
            await updateMyProfile({
                display_name: displayName.trim() || null,
                notify_enabled: notifyEnabled,
            });

            await refreshProfile();
            setMessage("保存しました。");
            showToast({ type: "success", message: "表示名を保存しました。" });
        } catch (e: any) {
            console.error(e);
            const msg = e?.message ?? "保存に失敗しました。";
            setError(msg);
            showToast({ type: "error", message: msg });
        } finally {
            setSaving(false);
        }
    };

    const changeEmail = async () => {
        if (!user) return;

        setSaving(true);
        setError(null);
        setMessage(null);

        try {
            const email = newEmail.trim();
            if (!email) {
                const msg = "メールアドレスを入力してください。";
                setError(msg);
                showToast({ type: "error", message: msg });
                return;
            }

            const { error } = await supabase.auth.updateUser({ email });
            if (error) throw error;

            const ok = "確認メールを送信しました。メール内のリンクで変更を完了してください。";
            setMessage(ok);
            showToast({ type: "success", message: "確認メールを送信しました。" });
        } catch (e: any) {
            console.error(e);
            const msg = e?.message ?? "メール変更に失敗しました。";
            setError(msg);
            showToast({ type: "error", message: msg });
        } finally {
            setSaving(false);
        }
    };

    const handleSignOut = async () => {
        setSaving(true);
        setError(null);
        setMessage(null);

        try {
            await signOut();
            showToast({ type: "success", message: "ログアウトしました。" });
            navigate("/login", { replace: true });
        } catch (e: any) {
            console.error(e);
            const msg = e?.message ?? "ログアウトに失敗しました。";
            setError(msg);
            showToast({ type: "error", message: msg });
        } finally {
            setSaving(false);
        }
    };

    // ---- ここから下は「表示の分岐」だけ（Hooksの後） ----
    if (initializing) {
        return (
            <div className="max-w-2xl mx-auto px-4 md:px-6 py-10">
                <h1 className="text-2xl font-bold text-kakurega-ink mb-6">マイページ</h1>
                <div className="bg-white/80 border border-black/10 rounded-3xl shadow-sm p-6">
                    <div className="text-sm text-kakurega-muted">読み込み中...</div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="max-w-2xl mx-auto px-4 md:px-6 py-10">
                <h1 className="text-2xl font-bold text-kakurega-ink mb-6">マイページ</h1>
                <div className="bg-white/80 border border-black/10 rounded-3xl shadow-sm p-6">
                    <div className="text-sm text-kakurega-muted">ログインが必要です。</div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-10">
            <h1 className="text-2xl font-bold text-kakurega-ink mb-6">マイページ</h1>

            <div className="bg-white/80 border border-black/10 rounded-3xl shadow-sm p-6 space-y-6">
                <section className="space-y-3">
                    <div className="text-sm font-bold text-kakurega-ink">プロフィール</div>

                    <div className="space-y-2">
                        <label className="text-xs text-kakurega-muted">表示名</label>
                        <input
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full rounded-2xl border border-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-kakurega-green/40 bg-white"
                            placeholder="ログインネーム"
                            disabled={saving}
                        />
                        {!profile && (
                            <div className="text-xs text-kakurega-muted">
                                プロフィール情報を取得中です（初回は少し時間がかかる場合があります）。
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-black/10 px-4 py-3 bg-white">
                        <div>
                            <div className="text-sm font-bold text-kakurega-ink">イベント通知</div>
                            <div className="text-xs text-kakurega-muted">
                                お気に入りイベントのリマインド等（後で実装）
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setNotifyEnabled((v) => !v)}
                            className={`px-4 py-2 rounded-full text-xs font-bold border transition-colors ${
                                notifyEnabled
                                    ? "bg-kakurega-green text-white border-kakurega-green"
                                    : "bg-white text-kakurega-ink border-black/10"
                            }`}
                            disabled={saving}
                        >
                            {notifyEnabled ? "ON" : "OFF"}
                        </button>
                    </div>
                </section>

                <section className="space-y-3">
                    <div className="text-sm font-bold text-kakurega-ink">メールアドレス</div>

                    <div className="space-y-2">
                        <label className="text-xs text-kakurega-muted">現在</label>
                        <div className="text-sm rounded-2xl border border-black/10 px-4 py-3 bg-white">
                            {user.email}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs text-kakurega-muted">変更（確認メールが届きます）</label>
                        <input
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            className="w-full rounded-2xl border border-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-kakurega-green/40 bg-white"
                            placeholder="new@example.com"
                            disabled={saving}
                        />
                        <button
                            type="button"
                            onClick={changeEmail}
                            className="px-5 py-3 rounded-2xl bg-white border border-kakurega-green/50 text-kakurega-green font-bold hover:bg-kakurega-green/5 transition-colors disabled:opacity-60"
                            disabled={saving}
                        >
                            メールを変更する
                        </button>
                    </div>
                </section>

                <section className="space-y-3">
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={saveProfile}
                            className="flex-1 px-5 py-3 rounded-2xl bg-kakurega-green text-white font-bold hover:bg-kakurega-dark-green transition-colors disabled:opacity-60"
                            disabled={saving}
                        >
                            保存する
                        </button>

                        <button
                            type="button"
                            onClick={handleSignOut}
                            className="px-5 py-3 rounded-2xl bg-white border border-black/10 text-kakurega-ink font-bold hover:bg-black/5 transition-colors disabled:opacity-60"
                            disabled={saving}
                        >
                            ログアウト
                        </button>
                    </div>

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
                </section>
            </div>

            <div className="mt-8 flex justify-center gap-3">
                <button
                    className="px-5 py-3 bg-white border border-black/10 rounded-xl text-xs font-bold text-kakurega-ink hover:bg-black/5 transition-colors disabled:opacity-60"
                    type="button"
                >
                    戻る
                </button>
                <button
                    onClick={() => navigate("/")}
                    className="px-5 py-3 bg-white border border-black/10 rounded-xl text-xs font-bold text-kakurega-ink hover:bg-black/5 transition-colors disabled:opacity-60"
                    type="button"
                >
                    ホームへ
                </button>
            </div>
        </div>
    );
};

export default MyPage;
