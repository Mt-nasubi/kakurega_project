// src/pages/organizer/events/edit.tsx

import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../../lib/supabase";

type EventRow = {
    id: string;
    organizer_id: string | null;
    title: string | null;
    description: string | null;
    prefecture: string | null;
    city: string | null;
    category: string | null;
    tags: string[] | null;
    location_name: string | null;
    latitude: number | null;
    longitude: number | null;
    official_url: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    start_date: string | null; // YYYY-MM-DD
    start_time: string | null; // HH:MM:SS
    end_date: string | null;
    end_time: string | null;
    is_public: boolean | null;
    status: string | null;
    image_paths: string[] | null;
    created_at: string | null;
    updated_at: string | null;
};

type FormState = {
    title: string;
    description: string;
    prefecture: string;
    city: string;
    category: string;
    tagsText: string; // comma separated
    location_name: string;
    latitudeText: string; // allow blank
    longitudeText: string;
    official_url: string;
    start_date: string;
    start_time: string;
    end_date: string;
    end_time: string;
    is_public: boolean;
    status: string; // draft/published/archived 等
};

const BUCKET_NAME = "event-images";

function normalizeTagsFromText(tagsText: string): string[] {
    const items = tagsText
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

    // 重複排除（大小区別なし）
    const seen = new Set<string>();
    const out: string[] = [];
    for (const t of items) {
        const key = t.toLowerCase();
        if (!seen.has(key)) {
            seen.add(key);
            out.push(t);
        }
    }
    return out;
}

function isValidHttpUrl(url: string): boolean {
    if (!url) return true;
    try {
        const u = new URL(url);
        return u.protocol === "http:" || u.protocol === "https:";
    } catch {
        return false;
    }
}

async function requireUserId(): Promise<string> {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
        throw error;
    }
    const userId = data.user?.id;
    if (!userId) {
        throw new Error("ログインが必要です。");
    }
    return userId;
}

async function getSignedUrl(path: string): Promise<string> {
    // 画像表示は署名URL（private想定）
    const { data, error } = await supabase.storage.from(BUCKET_NAME).createSignedUrl(path, 60 * 10);
    if (error) throw error;
    return data.signedUrl;
}

async function uploadImage(eventId: string, file: File): Promise<string> {
    const userId = await requireUserId();

    const extRaw = file.name.split(".").pop() || "jpg";
    const ext = extRaw.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const filename = `${crypto.randomUUID()}.${ext}`;
    const path = `events/${userId}/${eventId}/${filename}`;

    const { error } = await supabase.storage.from(BUCKET_NAME).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || undefined,
    });
    if (error) {
        throw error;
    }
    return path;
}

async function removeImage(path: string): Promise<void> {
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);
    if (error) throw error;
}

const emptyForm: FormState = {
    title: "",
    description: "",
    prefecture: "",
    city: "",
    category: "",
    tagsText: "",
    location_name: "",
    latitudeText: "",
    longitudeText: "",
    official_url: "",
    start_date: "",
    start_time: "",
    end_date: "",
    end_time: "",
    is_public: false,
    status: "draft",
};

const EditOrganizerEventPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [errorMsg, setErrorMsg] = useState<string>("");
    const [successMsg, setSuccessMsg] = useState<string>("");

    const [eventRow, setEventRow] = useState<EventRow | null>(null);
    const [form, setForm] = useState<FormState>(emptyForm);

    const [imagePaths, setImagePaths] = useState<string[]>([]);
    const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
    const [imageBusy, setImageBusy] = useState(false);

    const canSubmit = useMemo(() => {
        if (!form.title.trim()) return false;
        if (!form.start_date) return false;
        if (form.official_url && !isValidHttpUrl(form.official_url)) return false;

        // 緯度経度は両方入ってるときだけ数値チェック
        const lat = form.latitudeText.trim();
        const lon = form.longitudeText.trim();
        if ((lat && !lon) || (!lat && lon)) return false;

        if (lat && lon) {
            const latN = Number(lat);
            const lonN = Number(lon);
            if (!Number.isFinite(latN) || !Number.isFinite(lonN)) return false;
            if (latN < -90 || latN > 90) return false;
            if (lonN < -180 || lonN > 180) return false;
        }
        return true;
    }, [form]);

    useEffect(() => {
        if (!id) {
            navigate("/organizer/dashboard", { replace: true });
            return;
        }

        const run = async (): Promise<void> => {
            setLoading(true);
            setErrorMsg("");
            setSuccessMsg("");

            try {
                await requireUserId();

                // 自分のイベントだけ取得できる想定（RLS）
                const { data, error } = await supabase
                    .from("events")
                    .select("*")
                    .eq("id", id)
                    .single();

                if (error) {
                    throw error;
                }

                const row = data as EventRow;
                setEventRow(row);

                const nextForm: FormState = {
                    title: row.title ?? "",
                    description: row.description ?? "",
                    prefecture: row.prefecture ?? "",
                    city: row.city ?? "",
                    category: row.category ?? "",
                    tagsText: (row.tags ?? []).join(", "),
                    location_name: row.location_name ?? "",
                    latitudeText: row.latitude == null ? "" : String(row.latitude),
                    longitudeText: row.longitude == null ? "" : String(row.longitude),
                    official_url: row.official_url ?? "",
                    start_date: row.start_date ?? "",
                    start_time: row.start_time ?? "",
                    end_date: row.end_date ?? "",
                    end_time: row.end_time ?? "",
                    is_public: Boolean(row.is_public),
                    status: row.status ?? "draft",
                };
                setForm(nextForm);

                const paths = row.image_paths ?? [];
                setImagePaths(paths);

                // 署名URL生成
                const urlMap: Record<string, string> = {};
                for (const p of paths) {
                    try {
                        urlMap[p] = await getSignedUrl(p);
                    } catch {
                        // 署名URL生成失敗しても一覧は出す
                        urlMap[p] = "";
                    }
                }
                setImageUrls(urlMap);
            } catch (e: any) {
                setErrorMsg(e?.message ?? "読み込みに失敗しました。");
            } finally {
                setLoading(false);
            }
        };

        run();
    }, [id, navigate]);

    const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const onSave = async (): Promise<void> => {
        if (!id) return;
        setSaving(true);
        setErrorMsg("");
        setSuccessMsg("");

        try {
            await requireUserId();

            const tags = normalizeTagsFromText(form.tagsText);
            const lat = form.latitudeText.trim();
            const lon = form.longitudeText.trim();

            const updatePayload: Partial<EventRow> = {
                title: form.title.trim(),
                description: form.description.trim() || null,
                prefecture: form.prefecture.trim() || null,
                city: form.city.trim() || null,
                category: form.category.trim() || null,
                tags: tags.length > 0 ? tags : null,
                location_name: form.location_name.trim() || null,
                latitude: lat ? Number(lat) : null,
                longitude: lon ? Number(lon) : null,
                official_url: form.official_url.trim() || null,
                start_date: form.start_date || null,
                start_time: form.start_time || null,
                end_date: form.end_date || null,
                end_time: form.end_time || null,
                is_public: form.is_public,
                status: form.status.trim() || "draft",
                image_paths: imagePaths,
                updated_at: new Date().toISOString(),
            };

            const { error } = await supabase.from("events").update(updatePayload).eq("id", id);
            if (error) throw error;

            setSuccessMsg("保存しました。");
        } catch (e: any) {
            setErrorMsg(e?.message ?? "保存に失敗しました。");
        } finally {
            setSaving(false);
        }
    };

    const onDelete = async (): Promise<void> => {
        if (!id) return;
        const ok = window.confirm("このイベントを削除します。よろしいですか？（元に戻せません）");
        if (!ok) return;

        setDeleting(true);
        setErrorMsg("");
        setSuccessMsg("");

        try {
            await requireUserId();

            // 先にDB削除（RLSで自分の行だけ）
            const { error } = await supabase.from("events").delete().eq("id", id);
            if (error) throw error;

            // 画像は残っても致命傷ではないが、できるだけ掃除
            if (imagePaths.length > 0) {
                try {
                    await supabase.storage.from(BUCKET_NAME).remove(imagePaths);
                } catch {
                    // ignore
                }
            }

            navigate("/organizer/dashboard", { replace: true });
        } catch (e: any) {
            setErrorMsg(e?.message ?? "削除に失敗しました。");
        } finally {
            setDeleting(false);
        }
    };

    const onPickImages = async (files: FileList | null): Promise<void> => {
        if (!id) return;
        if (!files || files.length === 0) return;

        setImageBusy(true);
        setErrorMsg("");
        setSuccessMsg("");

        try {
            const nextPaths: string[] = [...imagePaths];
            const nextUrls: Record<string, string> = { ...imageUrls };

            for (const file of Array.from(files)) {
                // 軽いバリデーション
                if (!file.type.startsWith("image/")) {
                    continue;
                }
                if (file.size > 8 * 1024 * 1024) {
                    // 8MB上限（必要なら調整）
                    continue;
                }

                const path = await uploadImage(id, file);
                nextPaths.push(path);

                try {
                    nextUrls[path] = await getSignedUrl(path);
                } catch {
                    nextUrls[path] = "";
                }
            }

            setImagePaths(nextPaths);
            setImageUrls(nextUrls);
            setSuccessMsg("画像を追加しました。保存ボタンで反映されます。");
        } catch (e: any) {
            setErrorMsg(e?.message ?? "画像の追加に失敗しました。");
        } finally {
            setImageBusy(false);
        }
    };

    const onRemoveImage = async (path: string): Promise<void> => {
        const ok = window.confirm("この画像を削除します。よろしいですか？");
        if (!ok) return;

        setImageBusy(true);
        setErrorMsg("");
        setSuccessMsg("");

        try {
            // Storageから削除
            await removeImage(path);

            // stateから除外（DB反映は保存時）
            setImagePaths((prev) => prev.filter((p) => p !== path));
            setImageUrls((prev) => {
                const next = { ...prev };
                delete next[path];
                return next;
            });

            setSuccessMsg("画像を削除しました。保存ボタンで反映されます。");
        } catch (e: any) {
            setErrorMsg(e?.message ?? "画像の削除に失敗しました。");
        } finally {
            setImageBusy(false);
        }
    };

    if (loading) {
        return (
            <div style={{ maxWidth: 920, margin: "0 auto", padding: 16 }}>
                <h1 style={{ fontSize: 22, marginBottom: 8 }}>イベント編集</h1>
                <p>読み込み中…</p>
            </div>
        );
    }

    if (!eventRow) {
        return (
            <div style={{ maxWidth: 920, margin: "0 auto", padding: 16 }}>
                <h1 style={{ fontSize: 22, marginBottom: 8 }}>イベント編集</h1>
                <p style={{ color: "#b00020" }}>{errorMsg || "イベントが見つかりません。"}</p>
                <Link to="/organizer/dashboard">ダッシュボードへ戻る</Link>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 920, margin: "0 auto", padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                <div>
                    <h1 style={{ fontSize: 22, marginBottom: 4 }}>イベント編集</h1>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>
                        <span>id: {eventRow.id}</span>
                        {eventRow.updated_at ? <span> / 更新: {new Date(eventRow.updated_at).toLocaleString()}</span> : null}
                    </div>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <Link to="/organizer/dashboard" style={{ textDecoration: "none" }}>
                        ← ダッシュボード
                    </Link>
                </div>
            </div>

            {errorMsg ? (
                <div
                    style={{
                        marginTop: 12,
                        padding: 12,
                        borderRadius: 10,
                        background: "rgba(176,0,32,0.08)",
                        border: "1px solid rgba(176,0,32,0.25)",
                    }}
                >
                    <div style={{ color: "#b00020", fontWeight: 600 }}>エラー</div>
                    <div style={{ marginTop: 6 }}>{errorMsg}</div>
                </div>
            ) : null}

            {successMsg ? (
                <div
                    style={{
                        marginTop: 12,
                        padding: 12,
                        borderRadius: 10,
                        background: "rgba(0,128,0,0.08)",
                        border: "1px solid rgba(0,128,0,0.25)",
                    }}
                >
                    <div style={{ fontWeight: 600 }}>完了</div>
                    <div style={{ marginTop: 6 }}>{successMsg}</div>
                </div>
            ) : null}

            <div style={{ marginTop: 16, padding: 14, borderRadius: 12, border: "1px solid rgba(0,0,0,0.12)" }}>
                <h2 style={{ fontSize: 16, margin: "0 0 10px 0" }}>基本情報</h2>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <label style={{ display: "grid", gap: 6 }}>
                        <span>タイトル（必須）</span>
                        <input
                            value={form.title}
                            onChange={(e) => setField("title", e.target.value)}
                            placeholder="例：〇〇マルシェ"
                            style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(0,0,0,0.2)" }}
                        />
                    </label>

                    <label style={{ display: "grid", gap: 6 }}>
                        <span>カテゴリ</span>
                        <input
                            value={form.category}
                            onChange={(e) => setField("category", e.target.value)}
                            placeholder="例：祭り / 朝市 / 体験"
                            style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(0,0,0,0.2)" }}
                        />
                    </label>

                    <label style={{ display: "grid", gap: 6, gridColumn: "1 / -1" }}>
                        <span>説明</span>
                        <textarea
                            value={form.description}
                            onChange={(e) => setField("description", e.target.value)}
                            rows={6}
                            placeholder="イベントの内容、注意事項など"
                            style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(0,0,0,0.2)", resize: "vertical" }}
                        />
                    </label>

                    <label style={{ display: "grid", gap: 6 }}>
                        <span>都道府県</span>
                        <input
                            value={form.prefecture}
                            onChange={(e) => setField("prefecture", e.target.value)}
                            placeholder="例：兵庫県"
                            style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(0,0,0,0.2)" }}
                        />
                    </label>

                    <label style={{ display: "grid", gap: 6 }}>
                        <span>市区町村</span>
                        <input
                            value={form.city}
                            onChange={(e) => setField("city", e.target.value)}
                            placeholder="例：神戸市"
                            style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(0,0,0,0.2)" }}
                        />
                    </label>

                    <label style={{ display: "grid", gap: 6 }}>
                        <span>場所名</span>
                        <input
                            value={form.location_name}
                            onChange={(e) => setField("location_name", e.target.value)}
                            placeholder="例：〇〇公園"
                            style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(0,0,0,0.2)" }}
                        />
                    </label>

                    <label style={{ display: "grid", gap: 6 }}>
                        <span>公式URL</span>
                        <input
                            value={form.official_url}
                            onChange={(e) => setField("official_url", e.target.value)}
                            placeholder="https://example.com"
                            style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(0,0,0,0.2)" }}
                        />
                        {!isValidHttpUrl(form.official_url) ? (
                            <span style={{ fontSize: 12, color: "#b00020" }}>http(s) のURLを入力してください</span>
                        ) : null}
                    </label>

                    <label style={{ display: "grid", gap: 6 }}>
                        <span>タグ（カンマ区切り）</span>
                        <input
                            value={form.tagsText}
                            onChange={(e) => setField("tagsText", e.target.value)}
                            placeholder="例：家族向け, 入場無料, 屋外"
                            style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(0,0,0,0.2)" }}
                        />
                    </label>

                    <label style={{ display: "grid", gap: 6 }}>
                        <span>公開</span>
                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                            <input
                                type="checkbox"
                                checked={form.is_public}
                                onChange={(e) => setField("is_public", e.target.checked)}
                            />
                            <span style={{ fontSize: 12, opacity: 0.8 }}>ONで一般公開一覧に表示</span>
                        </div>
                    </label>

                    <label style={{ display: "grid", gap: 6 }}>
                        <span>状態</span>
                        <select
                            value={form.status}
                            onChange={(e) => setField("status", e.target.value)}
                            style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(0,0,0,0.2)" }}
                        >
                            <option value="draft">draft（下書き）</option>
                            <option value="published">published（公開）</option>
                            <option value="archived">archived（アーカイブ）</option>
                        </select>
                    </label>

                    <label style={{ display: "grid", gap: 6 }}>
                        <span>開始日（必須）</span>
                        <input
                            type="date"
                            value={form.start_date}
                            onChange={(e) => setField("start_date", e.target.value)}
                            style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(0,0,0,0.2)" }}
                        />
                    </label>

                    <label style={{ display: "grid", gap: 6 }}>
                        <span>開始時刻</span>
                        <input
                            type="time"
                            value={form.start_time}
                            onChange={(e) => setField("start_time", e.target.value)}
                            style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(0,0,0,0.2)" }}
                        />
                    </label>

                    <label style={{ display: "grid", gap: 6 }}>
                        <span>終了日</span>
                        <input
                            type="date"
                            value={form.end_date}
                            onChange={(e) => setField("end_date", e.target.value)}
                            style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(0,0,0,0.2)" }}
                        />
                    </label>

                    <label style={{ display: "grid", gap: 6 }}>
                        <span>終了時刻</span>
                        <input
                            type="time"
                            value={form.end_time}
                            onChange={(e) => setField("end_time", e.target.value)}
                            style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(0,0,0,0.2)" }}
                        />
                    </label>

                    <label style={{ display: "grid", gap: 6 }}>
                        <span>緯度</span>
                        <input
                            value={form.latitudeText}
                            onChange={(e) => setField("latitudeText", e.target.value)}
                            placeholder="例：34.6913"
                            style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(0,0,0,0.2)" }}
                        />
                    </label>

                    <label style={{ display: "grid", gap: 6 }}>
                        <span>経度</span>
                        <input
                            value={form.longitudeText}
                            onChange={(e) => setField("longitudeText", e.target.value)}
                            placeholder="例：135.1830"
                            style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(0,0,0,0.2)" }}
                        />
                    </label>

                    {((form.latitudeText && !form.longitudeText) || (!form.latitudeText && form.longitudeText)) ? (
                        <div style={{ gridColumn: "1 / -1", fontSize: 12, color: "#b00020" }}>
                            緯度・経度は両方入力するか、両方空にしてください
                        </div>
                    ) : null}
                </div>
            </div>

            <div style={{ marginTop: 16, padding: 14, borderRadius: 12, border: "1px solid rgba(0,0,0,0.12)" }}>
                <h2 style={{ fontSize: 16, margin: "0 0 10px 0" }}>写真</h2>

                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        disabled={imageBusy}
                        onChange={(e) => void onPickImages(e.target.files)}
                    />
                    <span style={{ fontSize: 12, opacity: 0.8 }}>
                        画像は最大8MB/枚（必要なら調整）。追加後は「保存」でDBに反映。
                    </span>
                </div>

                {imagePaths.length === 0 ? (
                    <p style={{ marginTop: 10, opacity: 0.8 }}>まだ画像がありません。</p>
                ) : (
                    <div
                        style={{
                            marginTop: 12,
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                            gap: 12,
                        }}
                    >
                        {imagePaths.map((p) => (
                            <div
                                key={p}
                                style={{
                                    border: "1px solid rgba(0,0,0,0.12)",
                                    borderRadius: 12,
                                    padding: 10,
                                    display: "grid",
                                    gap: 8,
                                }}
                            >
                                {imageUrls[p] ? (
                                    <img
                                        src={`${imageUrls[p]}?t=${p}`}
                                        alt=""
                                        style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 10 }}
                                    />
                                ) : (
                                    <div
                                        style={{
                                            width: "100%",
                                            height: 140,
                                            borderRadius: 10,
                                            background: "rgba(0,0,0,0.06)",
                                            display: "grid",
                                            placeItems: "center",
                                            fontSize: 12,
                                            opacity: 0.8,
                                        }}
                                    >
                                        preview unavailable
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={() => void onRemoveImage(p)}
                                    disabled={imageBusy}
                                    style={{
                                        padding: "8px 10px",
                                        borderRadius: 10,
                                        border: "1px solid rgba(0,0,0,0.18)",
                                        background: "white",
                                        cursor: "pointer",
                                    }}
                                >
                                    この画像を削除
                                </button>

                                <div style={{ fontSize: 11, opacity: 0.7, wordBreak: "break-all" }}>{p}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div style={{ marginTop: 16, display: "flex", gap: 10, justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <button
                        type="button"
                        onClick={() => void onSave()}
                        disabled={!canSubmit || saving || deleting || imageBusy}
                        style={{
                            padding: "10px 14px",
                            borderRadius: 12,
                            border: "1px solid rgba(0,0,0,0.18)",
                            background: !canSubmit || saving || deleting || imageBusy ? "rgba(0,0,0,0.06)" : "white",
                            cursor: !canSubmit || saving || deleting || imageBusy ? "not-allowed" : "pointer",
                            fontWeight: 700,
                        }}
                        title={!canSubmit ? "必須項目を入力してください" : ""}
                    >
                        {saving ? "保存中…" : "保存"}
                    </button>

                    <div style={{ fontSize: 12, opacity: 0.8 }}>
                        {canSubmit ? "" : "タイトルと開始日は必須です"}
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => void onDelete()}
                    disabled={saving || deleting || imageBusy}
                    style={{
                        padding: "10px 14px",
                        borderRadius: 12,
                        border: "1px solid rgba(176,0,32,0.35)",
                        background: "rgba(176,0,32,0.08)",
                        cursor: saving || deleting || imageBusy ? "not-allowed" : "pointer",
                        color: "#b00020",
                        fontWeight: 700,
                    }}
                >
                    {deleting ? "削除中…" : "イベント削除"}
                </button>
            </div>

            <div style={{ marginTop: 14, fontSize: 12, opacity: 0.85 }}>
                <p style={{ margin: 0 }}>
                    ※「自分のイベントしか編集できない」制約は、DB側のRLSで保証される前提です。
                </p>
            </div>
        </div>
    );
};

export default EditOrganizerEventPage;
