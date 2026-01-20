import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { updateMyProfile } from "../lib/profile";
import { useAuth } from "../lib/auth";

const MyPage: React.FC = () => {
    const { user, profile, refreshProfile, signOut } = useAuth();

    const initialName = useMemo(
        () => profile?.display_name ?? "",
        [profile?.display_name]
    );
    const initialNotify = useMemo(
        () => profile?.notify_enabled ?? true,
        [profile?.notify_enabled]
    );

    const [displayName, setDisplayName] = useState(initialName);
    const [notifyEnabled, setNotifyEnabled] = useState(initialNotify);
    const [newEmail, setNewEmail] = useState(user?.email ?? "");

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setDisplayName(initialName);
        setNotifyEnabled(initialNotify);
        setNewEmail(user?.email ?? "");
    }, [initialName, initialNotify, user?.email]);

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
        } catch (e: any) {
            console.error(e);
            setError(e?.message ?? "保存に失敗しました。");
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
                setError("メールアドレスを入力してください。");
                return;
            }

            // Supabase Auth のメール変更（通常、確認メールが飛んで確定する）
            const { error } = await supabase.auth.updateUser({ email });
            if (error) throw error;

            setMessage("確認メールを送信しました。メール内のリンクで変更を完了してください。");
        } catch (e: any) {
            console.error(e);
            setError(e?.message ?? "メール変更に失敗しました。");
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
        } catch (e: any) {
            setError(e?.message ?? "ログアウトに失敗しました。");
        } finally {
            setSaving(false);
        }
    };

    if (!user) return null;

    return (
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-10">
            <h1 className="text-2xl font-bold text-kakurega-ink mb-6">マイページ</h1>

            <div className="bg-white/80 border border-black/10 rounded-3xl shadow-sm p-6 space-y-6">
                {/* プロフィール */}
                <section className="space-y-3">
                    <div className="text-sm font-bold text-kakurega-ink">プロフィール</div>

                    <div className="space-y-2">
                        <label className="text-xs text-kakurega-muted">表示名</label>
                        <input
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full rounded-2xl border border-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-kakurega-green/40 bg-white"
                            placeholder="例：太一"
                            disabled={saving}
                        />
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

                {/* メールアドレス */}
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

                {/* 保存・ログアウト */}
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
        </div>
    );
};

export default MyPage;
