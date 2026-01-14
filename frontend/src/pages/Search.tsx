import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { CalendarPlus, Filter, MapPin, Star } from "lucide-react";

import type { KakuregaEvent, UserLocation } from "../types/types";
import { useToast } from "../context/toast";
import { addFavorite } from "../lib/apiClient";
import MapViewer from "../components/MapViewer";
import AddToCalendarButton from "../components/AddToCalendarButton";

const SearchPage: React.FC<{
    events: any[];
    eventsLoading: boolean;
    favIds: Set<string>;
    setFavIds: React.Dispatch<React.SetStateAction<Set<string>>>;
}> = ({ events, eventsLoading, favIds, setFavIds }) => {
    const { pushToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    const [filters, setFilters] = useState({
        type: "",
        budget: "",
        period: "",
        dateFrom: "",
        dateTo: "",
        distance: "",
        area: "",
        city: "",
    });

    const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
    const [locStatus, setLocStatus] = useState("");
    const [filteredEvents, setFilteredEvents] = useState<KakuregaEvent[]>([]);
    const [, setSearchParams] = useSearchParams();

    const getSavedIds = (): string[] => {
        try {
            const raw = localStorage.getItem("savedEventIds");
            const parsed = raw ? JSON.parse(raw) : [];

            if (!Array.isArray(parsed)) return [];

            return parsed
                .flat(Infinity)
                .map((v: any) => String(v))
                .filter((s: string) => s.length > 0 && s !== "undefined" && s !== "null");
        } catch {
            return [];
        }
    };

    const handleSave = async (id: string) => {
        const sid = String(id);

        if (favIds.has(sid)) {
            pushToast?.("すでに保存されています", "info");
            return;
        }

        try {
            const ok = await addFavorite(sid);
            if (!ok) {
                pushToast?.(
                    "お気に入りにはログインが必要です",
                    "info",
                    {
                        label: "ログインする",
                        onClick: () => {
                            const next = `${location.pathname}${location.search}`;
                            navigate(`/login?next=${encodeURIComponent(next)}`);
                        },
                    }
                );
                return;
            }

            setFavIds((prev) => {
                const next = new Set(prev);
                next.add(sid);
                return next;
            });
            pushToast?.("保存しました", "success");
        } catch {
            pushToast?.("保存に失敗しました", "error");
        }
    };

    const openDetail = (id: string) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set("event_id", id);
            return next;
        });
    };

    const haversineKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
        const R = 6371;
        const toRad = (d: number) => (d * Math.PI) / 180;
        const dLat = toRad(lat2 - lat1);
        const dLng = toRad(lng2 - lng1);
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) *
                Math.cos(toRad(lat2)) *
                Math.sin(dLng / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const getPeriodRange = (p: string) => {
        const now = new Date();
        const toYmd = (d: Date) => d.toISOString().split("T")[0];
        let from: string | null = null;
        let to: string | null = null;

        if (p === "today") {
            from = toYmd(now);
            to = toYmd(now);
        } else if (p === "week") {
            const start = new Date(now);
            const day = now.getDay();
            const diff = now.getDate() - day + (day === 0 ? -6 : 1);
            start.setDate(diff);
            const end = new Date(start);
            end.setDate(start.getDate() + 6);
            from = toYmd(start);
            to = toYmd(end);
        } else if (p === "month") {
            from = toYmd(new Date(now.getFullYear(), now.getMonth(), 1));
            to = toYmd(new Date(now.getFullYear(), now.getMonth() + 1, 0));
        } else if (p === "year") {
            from = `${now.getFullYear()}-01-01`;
            to = `${now.getFullYear()}-12-31`;
        }
        return { from, to };
    };

    const applyFilters = () => {
        let result = [...events];
        console.log("filtered before", result);

        if (filters.type) result = result.filter((e) => e.category === filters.type);
        if (filters.budget) result = result.filter((e) => e.priceYen <= Number(filters.budget));

        if (filters.period) {
            let from: string | null = null;
            let to: string | null = null;
            if (filters.period === "range") {
                from = filters.dateFrom;
                to = filters.dateTo;
            } else {
                const r = getPeriodRange(filters.period);
                from = r.from;
                to = r.to;
            }
            result = result.filter((e) => {
                if (!e.date) return false;
                if (from && e.date < from) return false;
                if (to && e.date > to) return false;
                return true;
            });
        }

        if (filters.area) result = result.filter((e) => e.area === filters.area);
        if (filters.city.trim()) result = result.filter((e) => e.city.includes(filters.city.trim()));

        if (filters.distance && userLocation) {
            const maxDist = Number(filters.distance);
            result = result
                .map((e) => ({
                    ...e,
                    distKm: haversineKm(userLocation.lat, userLocation.lng, e.lat, e.lng),
                }))
                .filter((e) => (e.distKm || 0) <= maxDist)
                .sort((a, b) => (a.distKm || 0) - (b.distKm || 0));
        }

        setFilteredEvents(result);
    };

    useEffect(() => {
        if (filters.distance) {
            if (!navigator.geolocation) {
                setLocStatus("このブラウザは位置情報に対応していません。");
                return;
            }
            setLocStatus("位置情報を取得中...");
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                    setLocStatus("現在地を取得しました。検索ボタンを押してください。");
                },
                () => {
                    setLocStatus("位置情報を取得できませんでした。");
                    setFilters((f) => ({ ...f, distance: "" }));
                },
                { enableHighAccuracy: true, timeout: 8000 }
            );
        } else {
            setUserLocation(null);
            setLocStatus("");
        }
    }, [filters.distance]);

    useEffect(() => {
        applyFilters();
    }, [events]);

    const handleChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 space-y-4">
            <section className="bg-white/80 backdrop-blur-md border border-black/10 rounded-[18px] p-5 shadow-md">
                <h1 className="font-serif text-2xl mb-2 text-kakurega-ink">条件で絞って、地図で見つける。</h1>
                <p className="text-xs opacity-80 mb-4 leading-relaxed">
                    タイプ・予算・期間・距離・地区で整理して、近くの小さなイベントを見つけます。
                </p>

                <div className="flex flex-wrap items-end gap-3 mb-3">
                    {[
                        { label: "タイプ", key: "type", options: [{ v: "", l: "全て" }, { v: "祭り", l: "祭り" }, { v: "朝市", l: "朝市" }, { v: "体験", l: "体験" }, { v: "展示", l: "展示" }] },
                        { label: "予算", key: "budget", options: [{ v: "", l: "指定なし" }, { v: "0", l: "無料" }, { v: "1000", l: "~1000円" }, { v: "3000", l: "~3000円" }, { v: "5000", l: "~5000円" }] },
                        { label: "期間", key: "period", options: [{ v: "", l: "指定なし" }, { v: "today", l: "今日" }, { v: "week", l: "今週" }, { v: "month", l: "今月" }, { v: "year", l: "今年" }, { v: "range", l: "日付指定" }] },
                        { label: "距離", key: "distance", options: [{ v: "", l: "指定なし" }, { v: "10", l: "車で30分 (10km)" }, { v: "20", l: "車で60分 (20km)" }, { v: "40", l: "車で90分 (40km)" }] },
                        { label: "地区", key: "area", options: [{ v: "", l: "指定なし" }, { v: "神戸", l: "神戸" }, { v: "阪神", l: "阪神" }, { v: "播磨", l: "播磨" }, { v: "丹波", l: "丹波" }, { v: "但馬", l: "但馬" }, { v: "淡路", l: "淡路" }] },
                    ].map((f) => (
                        <label key={f.key} className="flex flex-col gap-1.5 min-w-[140px] flex-1">
                            <span className="text-[10px] text-kakurega-muted font-bold">{f.label}</span>
                            <select
                                className="p-2.5 rounded-xl border border-black/20 bg-white text-xs focus:ring-2 focus:ring-kakurega-green/30 outline-none"
                                value={(filters as any)[f.key]}
                                onChange={(e) => handleChange(f.key, e.target.value)}
                            >
                                {f.options.map((o) => (
                                    <option key={o.v} value={o.v}>
                                        {o.l}
                                    </option>
                                ))}
                            </select>
                        </label>
                    ))}

                    <label className="flex flex-col gap-1.5 min-w-[140px] flex-1">
                        <span className="text-[10px] text-kakurega-muted font-bold">市</span>
                        <input
                            type="text"
                            placeholder="例: 明石 / 姫路"
                            className="p-2.5 rounded-xl border border-black/20 bg-white text-xs focus:ring-2 focus:ring-kakurega-green/30 outline-none"
                            value={filters.city}
                            onChange={(e) => handleChange("city", e.target.value)}
                        />
                    </label>
                </div>

                {filters.period === "range" && (
                    <div className="flex items-end gap-2 mb-4 animate-fade-in bg-kakurega-paper/50 p-3 rounded-xl">
                        <label className="flex flex-col gap-1 flex-1">
                            <span className="text-[10px] text-kakurega-muted">開始</span>
                            <input
                                type="date"
                                className="p-2 rounded-lg border border-black/10 text-xs"
                                value={filters.dateFrom}
                                onChange={(e) => handleChange("dateFrom", e.target.value)}
                            />
                        </label>
                        <span className="pb-2 text-xs opacity-50">〜</span>
                        <label className="flex flex-col gap-1 flex-1">
                            <span className="text-[10px] text-kakurega-muted">終了</span>
                            <input
                                type="date"
                                className="p-2 rounded-lg border border-black/10 text-xs"
                                value={filters.dateTo}
                                onChange={(e) => handleChange("dateTo", e.target.value)}
                            />
                        </label>
                    </div>
                )}

                <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t border-black/5 pt-4">
                    <p className="text-xs text-kakurega-green h-4">{locStatus}</p>
                    <button
                        onClick={applyFilters}
                        className="w-full md:w-auto px-6 py-3 bg-kakurega-green text-white rounded-xl text-xs font-bold shadow hover:bg-kakurega-dark-green transition-colors flex items-center justify-center gap-2"
                    >
                        <Filter size={14} /> 検索条件を適用
                    </button>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white rounded-[18px] border border-black/10 overflow-hidden shadow-lg h-[400px] md:h-[500px] relative z-0">
                        <MapViewer events={filteredEvents} userLocation={userLocation} onSave={handleSave} />
                    </div>
                </div>

                <div className="bg-white/80 backdrop-blur border border-black/10 rounded-[18px] p-4 shadow-md flex flex-col h-[500px]">
                    <div className="flex justify-between items-baseline mb-3 pb-2 border-b border-black/5">
                        <h2 className="font-serif text-lg text-kakurega-ink">検索結果</h2>
                        <span className="text-xs text-kakurega-muted font-bold">{filteredEvents.length}件</span>
                    </div>

                    <div className="overflow-y-auto flex-1 pr-1 space-y-3 custom-scrollbar">
                        {filteredEvents.length === 0 ? (
                            <div className="text-center py-10 opacity-60 text-sm">
                                条件に合うイベントが<br />
                                見つかりませんでした。
                            </div>
                        ) : (
                            filteredEvents.map((e) => (
                                <div
                                    key={e.id}
                                    onClick={() => openDetail(e.id)}
                                    className="bg-white border border-black/5 rounded-xl p-3 hover:border-kakurega-green/50 hover:shadow-md transition-all cursor-pointer group"
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-sm text-kakurega-ink group-hover:text-kakurega-green transition-colors">
                                            {e.title}
                                        </h3>
                                        <span className="text-[10px] bg-kakurega-paper px-1.5 py-0.5 rounded text-kakurega-dark-green whitespace-nowrap">
                                            {e.category}
                                        </span>
                                    </div>

                                    <p className="text-xs text-kakurega-muted mb-2">
                                        {e.date} / {e.city}
                                        <span className="text-kakurega-green font-bold ml-1">
                                            {e.priceYen === 0 ? "無料" : `¥${e.priceYen}`}
                                        </span>
                                        {e.distKm !== undefined && e.distKm !== null && (
                                            <span className="text-[10px] ml-1 opacity-70">
                                                ({e.distKm.toFixed(1)}km)
                                            </span>
                                        )}
                                    </p>

                                    <div className="flex justify-end gap-2">
                                        <AddToCalendarButton
                                            event={e}
                                            className="text-[10px] px-2 py-1 rounded border border-black/10 hover:bg-gray-50 flex items-center gap-1 text-kakurega-muted hover:text-kakurega-green transition-colors"
                                        >
                                            <CalendarPlus size={10} /> 追加
                                        </AddToCalendarButton>

                                        <button
                                            onClick={(ev) => {
                                                ev.stopPropagation();
                                                window.scrollTo({ top: 0, behavior: "smooth" });
                                            }}
                                            className="text-[10px] px-2 py-1 rounded border border-black/10 hover:bg-gray-50 flex items-center gap-1 text-kakurega-muted"
                                        >
                                            <MapPin size={10} /> 地図
                                        </button>

                                        <button
                                            onClick={(ev) => {
                                                ev.stopPropagation();
                                                handleSave(e.id);
                                            }}
                                            className="text-[10px] px-2 py-1 rounded bg-kakurega-paper hover:bg-kakurega-paper-light border border-black/5 flex items-center gap-1 text-kakurega-dark-green font-bold"
                                        >
                                            <Star size={10} /> 保存
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchPage;
