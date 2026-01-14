import React, { useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Calendar, MapPin, User, Tag, Star, X, CalendarPlus, Check, Link as LinkIcon } from "lucide-react";

import type { KakuregaEvent } from "../types/types";
import { useToast } from "../context/toast";
import { addFavorite, removeFavorite } from "../lib/apiClient";
import AddToCalendarButton from "./AddToCalendarButton";
import CopyLinkButton from "./CopyLinkButton";
import { FALLBACK_IMAGE } from "../lib/storage";

const EventDetailModal: React.FC<{
    eventId: string;
    onClose: () => void;
    events: any[];
    favIds: Set<string>;
    setFavIds: React.Dispatch<React.SetStateAction<Set<string>>>;
}> = ({ eventId, onClose, events, favIds, setFavIds }) => {
    const event = useMemo(
        () => events.find((e) => String(e.id) === String(eventId)),
        [events, eventId]
    );

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    const isSaved = favIds.has(String(eventId));
    const { pushToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    const toggleSave = async () => {
        const id = String(eventId);
        const isFav = favIds.has(id);

        try {
            if (isFav) {
                const ok = await removeFavorite(id);
                if (!ok) {
                    pushToast(
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
                    next.delete(id);
                    return next;
                });
                pushToast("お気に入りから削除しました", "info");
            } else {
                const ok = await addFavorite(id);
                if (!ok) {
                    pushToast(
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
                    next.add(id);
                    return next;
                });
                pushToast("保存しました", "success");
            }
        } catch {
            pushToast("保存に失敗しました", "error");
        }
    };

    if (!event) return null;

    const e = event as KakuregaEvent;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="bg-[#f8f1e3] w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl relative overflow-hidden flex flex-col animate-fade-in">
                <div className="h-56 sm:h-72 relative shrink-0">
                    <img
                        src={e.imageUrl || FALLBACK_IMAGE}
                        className="w-full h-full object-cover"
                        alt={e.title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-kakurega-ink/80 via-transparent to-transparent" />
                    <div className="absolute top-4 right-4 flex gap-2 z-10">
                        <CopyLinkButton
                            eventId={String(e.id)}
                            className="bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-md transition-colors flex items-center justify-center"
                        >
                            {(copied: boolean) => (copied ? <Check size={24} /> : <LinkIcon size={24} />)}
                        </CopyLinkButton>

                        <button
                            onClick={onClose}
                            className="bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-md transition-colors flex items-center justify-center"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="absolute bottom-0 left-0 p-6 text-white w-full">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-3 py-1 bg-kakurega-green text-xs font-bold rounded-full shadow-sm border border-white/20">
                                {e.category}
                            </span>
                            {e.distKm !== undefined && e.distKm !== null && (
                                <span className="px-2 py-1 bg-black/40 backdrop-blur text-xs rounded-full flex items-center gap-1">
                                    <MapPin size={10} /> {e.distKm.toFixed(1)}km
                                </span>
                            )}
                        </div>
                        <h2 className="font-serif text-2xl sm:text-3xl font-bold leading-tight drop-shadow-md">
                            {e.title}
                        </h2>
                    </div>
                </div>

                <div className="overflow-y-auto p-6 custom-scrollbar bg-[#f8f1e3]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                        <div className="bg-white/60 p-3.5 rounded-2xl border border-black/5 flex items-start gap-3">
                            <div className="p-2 bg-kakurega-green/10 rounded-full text-kakurega-green mt-0.5">
                                <Calendar size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] text-kakurega-muted font-bold tracking-wider">DATE</p>
                                <p className="font-bold text-kakurega-ink text-sm">
                                    {e.date.replace(/-/g, ".")}
                                </p>
                                <p className="text-xs text-kakurega-muted mt-0.5">
                                    {e.startTime} - {e.endTime}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white/60 p-3.5 rounded-2xl border border-black/5 flex items-start gap-3">
                            <div className="p-2 bg-kakurega-green/10 rounded-full text-kakurega-green mt-0.5">
                                <MapPin size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] text-kakurega-muted font-bold tracking-wider">AREA</p>
                                <p className="font-bold text-kakurega-ink text-sm">{e.city}</p>
                                <p className="text-xs text-kakurega-muted mt-0.5">{e.area}</p>
                            </div>
                        </div>

                        <div className="bg-white/60 p-3.5 rounded-2xl border border-black/5 flex items-start gap-3">
                            <div className="p-2 bg-kakurega-green/10 rounded-full text-kakurega-green mt-0.5">
                                <User size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] text-kakurega-muted font-bold tracking-wider">ORGANIZER</p>
                                <p className="font-bold text-kakurega-ink text-sm">{e.organizer || "詳細なし"}</p>
                            </div>
                        </div>

                        <div className="bg-white/60 p-3.5 rounded-2xl border border-black/5 flex items-start gap-3">
                            <div className="p-2 bg-kakurega-green/10 rounded-full text-kakurega-green mt-0.5">
                                <Tag size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] text-kakurega-muted font-bold tracking-wider">PRICE</p>
                                <p className="font-bold text-kakurega-green text-sm">
                                    {e.priceYen === 0 ? "無料" : `¥${e.priceYen.toLocaleString()}`}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-1 h-5 bg-kakurega-green rounded-full"></div>
                            <h3 className="font-serif text-lg font-bold text-kakurega-ink">イベント詳細</h3>
                        </div>
                        <p className="leading-loose text-sm text-kakurega-ink/90 whitespace-pre-wrap font-medium">
                            {e.description || "詳細情報は現在確認中です。主催者へお問い合わせください。"}
                        </p>
                    </div>

                    {e.tags && e.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-8">
                            {e.tags.map((t) => (
                                <span
                                    key={t}
                                    className="px-3 py-1.5 bg-white border border-black/5 rounded-lg text-xs font-medium text-kakurega-muted shadow-sm"
                                >
                                    {t}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="flex flex-col gap-3 pt-6 border-t border-black/10">
                        <div className="flex gap-3">
                            <AddToCalendarButton
                                event={e}
                                className="flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 bg-white border-2 border-transparent hover:border-kakurega-green/30 shadow-sm text-kakurega-ink rounded-xl transition-all"
                            >
                                <CalendarPlus size={18} />
                                予定に追加
                            </AddToCalendarButton>

                            <button
                                onClick={toggleSave}
                                className={`flex-1 py-3 rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 border-2
                                    ${isSaved
                                        ? "bg-white border-kakurega-green text-kakurega-green"
                                        : "bg-kakurega-green border-transparent text-white hover:bg-kakurega-dark-green"
                                    }`}
                            >
                                <Star size={18} fill={isSaved ? "currentColor" : "none"} />
                                {isSaved ? "保存済み" : "保存する"}
                            </button>
                        </div>

                        <div className="flex justify-center">
                            <Link
                                to={`/search?event_id=${encodeURIComponent(String(eventId))}`}
                                onClick={onClose}
                                className="text-xs text-kakurega-muted flex items-center gap-1 hover:text-kakurega-green transition-colors py-2"
                            >
                                <MapPin size={12} />
                                地図で位置を確認する
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetailModal;
