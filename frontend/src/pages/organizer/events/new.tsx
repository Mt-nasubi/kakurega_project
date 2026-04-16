import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabase";

type EventInsert = {
    organizer_id: string;
    title: string;
    description: string;
    prefecture: string;
    city: string;
    category: string;
    location_name: string;
    latitude: number | null;
    longitude: number | null;
    tags: string[];
    status: string;
    is_public: boolean;
    official_url: string;
    contact_email: string;
    contact_phone: string;
    start_date: string | null;
    start_time: string | null;
    end_date: string | null;
    end_time: string | null;
    image_paths: string[];
    price_yen: number;
    fee_note: string;
    target_audience: string;
    indoor_outdoor: string;
    vibe: string;
    capacity: number | null;
    reservation_required: boolean;
};

function splitTags(s: string): string[] {
    return s
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
}

function getExt(name: string): string {
    const parts = name.split(".");
    const last = parts[parts.length - 1];
    return last ? last.toLowerCase() : "jpg";
}

async function requireUserId(): Promise<string> {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    const uid = data.user?.id;
    if (!uid) throw new Error("ログインが必要です。");
    return uid;
}

async function uploadImages(userId: string, eventId: string, files: File[]): Promise<string[]> {
    if (files.length === 0) return [];

    const paths: string[] = [];
    for (const f of files) {
        const ext = getExt(f.name);
        const fileName = `${crypto.randomUUID()}.${ext}`;
        const path = `events/${userId}/${eventId}/${fileName}`;

        const { error } = await supabase.storage
            .from("event-images")
            .upload(path, f, { cacheControl: "3600", upsert: false });

        if (error) throw error;
        paths.push(path);
    }
    return paths;
}

const OrganizerEventNewPage: React.FC = () => {
    const nav = useNavigate();

    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [prefecture, setPrefecture] = useState("");
    const [city, setCity] = useState("");
    const [category, setCategory] = useState("");
    const [locationName, setLocationName] = useState("");
    const [officialUrl, setOfficialUrl] = useState("");
    const [status, setStatus] = useState("draft");
    const [isPublic, setIsPublic] = useState(false);

    const [startDate, setStartDate] = useState<string>("");
    const [startTime, setStartTime] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [endTime, setEndTime] = useState<string>("");

    const [tagsRaw, setTagsRaw] = useState("");
    const [latitudeRaw, setLatitudeRaw] = useState("");
    const [longitudeRaw, setLongitudeRaw] = useState("");

    const [files, setFiles] = useState<File[]>([]);
    const [contactEmail, setContactEmail] = useState("");
    const [contactPhone, setContactPhone] = useState("");
    const [priceYen, setPriceYen] = useState("0");
    const [feeNote, setFeeNote] = useState("");
    const [targetAudience, setTargetAudience] = useState("");
    const [indoorOutdoor, setIndoorOutdoor] = useState("indoor");
    const [vibe, setVibe] = useState("");
    const [capacityRaw, setCapacityRaw] = useState("");
    const [reservationRequired, setReservationRequired] = useState(false);

    const tags = useMemo(() => splitTags(tagsRaw), [tagsRaw]);

    const validate = (): string | null => {
        if (!title.trim()) return "タイトルは必須です。";
        if (!prefecture.trim()) return "都道府県は必須です。";
        if (!city.trim()) return "市区町村は必須です。";
        if (!category.trim()) return "カテゴリは必須です。";
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const v = validate();
        if (v) {
            setError(v);
            return;
        }

        setBusy(true);
        try {
            const userId = await requireUserId();

            const lat = latitudeRaw.trim() ? Number(latitudeRaw) : null;
            const lng = longitudeRaw.trim() ? Number(longitudeRaw) : null;

            const capacity = capacityRaw.trim() ? Number(capacityRaw) : null;
            const price = priceYen.trim() ? Number(priceYen) : 0;
                    
            const payload: EventInsert = {
                organizer_id: userId,
                title: title.trim(),
                description: description.trim(),
                prefecture: prefecture.trim(),
                city: city.trim(),
                category: category.trim(),
                location_name: locationName.trim(),
                latitude: Number.isFinite(lat as any) ? lat : null,
                longitude: Number.isFinite(lng as any) ? lng : null,
                tags,
                status,
                is_public: isPublic,
                official_url: officialUrl.trim(),
                contact_email: contactEmail.trim(),
                contact_phone: contactPhone.trim(),
                start_date: startDate ? startDate : null,
                start_time: startTime ? startTime : null,
                end_date: endDate ? endDate : null,
                end_time: endTime ? endTime : null,
                image_paths: [],
                price_yen: Number.isFinite(price) ? price : 0,
                fee_note: feeNote.trim(),
                target_audience: targetAudience.trim(),
                indoor_outdoor: indoorOutdoor,
                vibe: vibe.trim(),
                capacity: Number.isFinite(capacity as any) ? capacity : null,
                reservation_required: reservationRequired,
            };

            // まずイベントを作る（event_id確定）
            const { data: inserted, error: insertErr } = await supabase
                .from("events")
                .insert(payload)
                .select("id")
                .single();

            if (insertErr) throw insertErr;

            const eventId = inserted.id as string;

            // 画像アップロード → image_paths 更新
            const uploadedPaths = await uploadImages(userId, eventId, files);
            if (uploadedPaths.length > 0) {
                const { error: updErr } = await supabase
                    .from("events")
                    .update({ image_paths: uploadedPaths })
                    .eq("id", eventId);

                if (updErr) throw updErr;
            }

            nav("/organizer/dashboard", { replace: true });
        } catch (err: any) {
            setError(err?.message ?? "作成に失敗しました。");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div style={{ maxWidth: 860, margin: "0 auto", padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <h1 style={{ fontSize: 24 }}>イベント新規作成</h1>
                <Link to="/organizer/dashboard" style={{ textDecoration: "underline" }}>
                    ダッシュボードへ戻る
                </Link>
            </div>

            {error && (
                <div style={{ background: "#ffecec", border: "1px solid #f5b5b5", padding: 12, borderRadius: 8, marginTop: 12 }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14, marginTop: 16 }}>
                <label style={{ display: "grid", gap: 6 }}>
                    <span>タイトル（必須）</span>
                    <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }} />
                </label>

                <label style={{ display: "grid", gap: 6 }}>
                    <span>説明</span>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }} />
                </label>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <label style={{ display: "grid", gap: 6 }}>
                        <span>都道府県（必須）</span>
                        <input value={prefecture} onChange={(e) => setPrefecture(e.target.value)} style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }} />
                    </label>
                    <label style={{ display: "grid", gap: 6 }}>
                        <span>市区町村（必須）</span>
                        <input value={city} onChange={(e) => setCity(e.target.value)} style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }} />
                    </label>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <label style={{ display: "grid", gap: 6 }}>
                        <span>カテゴリ（必須）</span>
                        <input value={category} onChange={(e) => setCategory(e.target.value)} style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }} />
                    </label>
                    <label style={{ display: "grid", gap: 6 }}>
                        <span>会場名</span>
                        <input value={locationName} onChange={(e) => setLocationName(e.target.value)} style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }} />
                    </label>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <label style={{ display: "grid", gap: 6 }}>
                        <span>開始日</span>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }} />
                    </label>
                    <label style={{ display: "grid", gap: 6 }}>
                        <span>開始時刻</span>
                        <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }} />
                    </label>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <label style={{ display: "grid", gap: 6 }}>
                        <span>終了日</span>
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }} />
                    </label>
                    <label style={{ display: "grid", gap: 6 }}>
                        <span>終了時刻</span>
                        <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }} />
                    </label>
                </div>

                <label style={{ display: "grid", gap: 6 }}>
                    <span>公式URL</span>
                    <input value={officialUrl} onChange={(e) => setOfficialUrl(e.target.value)} style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }} />
                </label>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <label style={{ display: "grid", gap: 6 }}>
                        <span>緯度</span>
                        <input value={latitudeRaw} onChange={(e) => setLatitudeRaw(e.target.value)} placeholder="例: 34.6901" style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }} />
                    </label>
                    <label style={{ display: "grid", gap: 6 }}>
                        <span>経度</span>
                        <input value={longitudeRaw} onChange={(e) => setLongitudeRaw(e.target.value)} placeholder="例: 135.1955" style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }} />
                    </label>
                </div>

                <label style={{ display: "grid", gap: 6 }}>
                    <span>タグ（カンマ区切り）</span>
                    <input value={tagsRaw} onChange={(e) => setTagsRaw(e.target.value)} placeholder="祭り, 朝市, 無料" style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }} />
                </label>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <label style={{ display: "grid", gap: 6 }}>
                        <span>状態</span>
                        <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}>
                            <option value="draft">draft</option>
                            <option value="scheduled">scheduled</option>
                            <option value="cancelled">cancelled</option>
                            <option value="finished">finished</option>
                        </select>
                    </label>
                    <label style={{ display: "flex", gap: 10, alignItems: "center", paddingTop: 26 }}>
                        <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                        <span>公開する（is_public）</span>
                    </label>
                </div>

                <label style={{ display: "grid", gap: 6 }}>
                    <span>写真（複数可）</span>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                            const list = e.target.files ? Array.from(e.target.files) : [];
                            setFiles(list);
                        }}
                    />
                    <div style={{ opacity: 0.75, fontSize: 13 }}>
                        選択: {files.length} 件
                    </div>
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
                    {busy ? "作成中..." : "作成する"}
                </button>
            </form>
        </div>
    );
};

export default OrganizerEventNewPage;
