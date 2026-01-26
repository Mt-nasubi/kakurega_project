import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

type EventRow = {
    id: string;
    created_at: string | null;
    updated_at: string | null;
    title: string | null;
    description: string | null;
    prefecture: string | null;
    city: string | null;
    category: string | null;
    status: string | null;
    is_public: boolean | null;
    start_date: string | null;
    start_time: string | null;
    end_date: string | null;
    end_time: string | null;
};

const OrganizerDashboardPage: React.FC = () => {
    const nav = useNavigate();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [events, setEvents] = useState<EventRow[]>([]);

    const load = async () => {
        setError(null);
        setBusy(true);
        try {
            const { data: userData, error: userErr } = await supabase.auth.getUser();
            if (userErr) throw userErr;

            const uid = userData.user?.id;
            if (!uid) {
                nav("/organizer/login", { replace: true });
                return;
            }

            const { data, error } = await supabase
                .from("events")
                .select("id, created_at, updated_at, title, description, prefecture, city, category, status, is_public, start_date, start_time, end_date, end_time")
                .order("created_at", { ascending: false });

            if (error) throw error;

            // RLSで自分のイベントだけ返るはず（events_select_own が効いている前提）
            setEvents((data ?? []) as EventRow[]);
        } catch (err: any) {
            setError(err?.message ?? "読み込みに失敗しました。");
        } finally {
            setBusy(false);
        }
    };

    useEffect(() => {
        void load();
    }, []);

    const formatDateTime = (d: string | null, t: string | null): string => {
        const dd = d ?? "";
        const tt = t ?? "";
        const s = `${dd} ${tt}`.trim();
        return s || "-";
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        nav("/organizer/login", { replace: true });
    };

    const handleDelete = async (id: string) => {
        const ok = window.confirm("このイベントを削除します。よろしいですか？");
        if (!ok) return;

        setBusy(true);
        setError(null);
        try {
            const { error } = await supabase.from("events").delete().eq("id", id);
            if (error) throw error;
            await load();
        } catch (err: any) {
            setError(err?.message ?? "削除に失敗しました。");
        } finally {
            setBusy(false);
        }
    };

    const handleTogglePublic = async (id: string, next: boolean) => {
        setBusy(true);
        setError(null);
        try {
            const { error } = await supabase.from("events").update({ is_public: next }).eq("id", id);
            if (error) throw error;
            setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, is_public: next } : e)));
        } catch (err: any) {
            setError(err?.message ?? "更新に失敗しました。");
        } finally {
            setBusy(false);
        }
    };

    const summary = useMemo(() => {
        const total = events.length;
        const pub = events.filter((e) => e.is_public).length;
        return { total, pub };
    }, [events]);

    return (
        <div style={{ maxWidth: 980, margin: "0 auto", padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                <div>
                    <h1 style={{ fontSize: 26, marginBottom: 6 }}>主催者ダッシュボード</h1>
                    <div style={{ opacity: 0.75 }}>
                        登録イベント: {summary.total} / 公開中: {summary.pub}
                    </div>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                    <Link to="/organizer/events/new" style={{ textDecoration: "underline" }}>
                        + 新規作成
                    </Link>
                    <button
                        onClick={handleLogout}
                        style={{ border: "1px solid #333", borderRadius: 10, padding: "8px 10px", background: "#fff", cursor: "pointer" }}
                    >
                        ログアウト
                    </button>
                </div>
            </div>

            {error && (
                <div style={{ background: "#ffecec", border: "1px solid #f5b5b5", padding: 12, borderRadius: 8, marginTop: 14 }}>
                    {error}
                </div>
            )}

            <div style={{ marginTop: 18 }}>
                {busy && <div style={{ opacity: 0.7, marginBottom: 8 }}>処理中...</div>}

                <div style={{ border: "1px solid #e5e5e5", borderRadius: 12, overflow: "hidden" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 0.8fr 0.8fr 1fr", gap: 0, background: "#fafafa", padding: 10, fontWeight: 600 }}>
                        <div>タイトル</div>
                        <div>期間</div>
                        <div>公開</div>
                        <div>状態</div>
                        <div style={{ textAlign: "right" }}>操作</div>
                    </div>

                    {events.length === 0 && (
                        <div style={{ padding: 14, opacity: 0.75 }}>
                            まだイベントがありません。「新規作成」から追加できます。
                        </div>
                    )}

                    {events.map((e) => (
                        <div
                            key={e.id}
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1.6fr 1fr 0.8fr 0.8fr 1fr",
                                gap: 0,
                                borderTop: "1px solid #eee",
                                padding: 10,
                                alignItems: "center",
                            }}
                        >
                            <div>
                                <div style={{ fontWeight: 600 }}>{e.title ?? "(無題)"}</div>
                                <div style={{ opacity: 0.75, fontSize: 13 }}>
                                    {e.prefecture ?? ""} {e.city ?? ""} / {e.category ?? "-"}
                                </div>
                            </div>

                            <div style={{ fontSize: 13 }}>
                                <div>開始: {formatDateTime(e.start_date, e.start_time)}</div>
                                <div>終了: {formatDateTime(e.end_date, e.end_time)}</div>
                            </div>

                            <div>
                                <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                    <input
                                        type="checkbox"
                                        checked={!!e.is_public}
                                        onChange={(ev) => handleTogglePublic(e.id, ev.target.checked)}
                                        disabled={busy}
                                    />
                                    <span style={{ fontSize: 13 }}>{e.is_public ? "公開" : "非公開"}</span>
                                </label>
                            </div>

                            <div style={{ fontSize: 13, opacity: 0.85 }}>{e.status ?? "-"}</div>

                            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                                <Link to={`/organizer/events/${e.id}/edit`} style={{ textDecoration: "underline" }}>
                                    編集
                                </Link>
                                <button
                                    onClick={() => handleDelete(e.id)}
                                    disabled={busy}
                                    style={{ border: "none", background: "transparent", textDecoration: "underline", cursor: "pointer", color: "#b00020" }}
                                >
                                    削除
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OrganizerDashboardPage;
