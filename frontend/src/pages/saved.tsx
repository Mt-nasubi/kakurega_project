import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Calendar, MapPin, Star, Trash2 } from "lucide-react";

import type { KakuregaEvent } from "../types/types";
import { useToast } from "../context/toast";
import { fetchMyFavoriteEvents, removeFavorite } from "../lib/apiClient";
import { dbToUiEvent } from "../lib/eventMapping";
import { FALLBACK_IMAGE } from "../lib/storage";
import { Card } from "../components/Card";
import SaveButton from "../components/SaveButton";


const SavedPage: React.FC<{
    favIds: Set<string>;
    setFavIds: React.Dispatch<React.SetStateAction<Set<string>>>;
}> = ({ favIds, setFavIds }) => {
    const { showToast } = useToast();
    const [savedEvents, setSavedEvents] = useState<KakuregaEvent[]>([]);
    const [, setSearchParams] = useSearchParams();

    useEffect(() => {
        const run = async () => {
            try {
                const favEvents = await fetchMyFavoriteEvents();
                const mapped = (favEvents ?? []).map(dbToUiEvent);
                setSavedEvents(mapped);
            } catch {
                setSavedEvents([]);
            }
        };
        void run();
    }, []);

    const removeSaved = async (id: string) => {
        const sid = String(id);

        // optimistic update
        setSavedEvents((prev) => prev.filter((e) => String(e.id) !== sid));
        setFavIds((prev) => {
            const next = new Set(prev);
            next.delete(sid);
            return next;
        });

        try {
            await removeFavorite(sid);
            showToast({ type: "info", message: "お気に入りから削除しました" });
        } catch {
            showToast({ type: "error", message: "削除に失敗しました" });
        }
    };

    const openDetail = (id: string) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set("event_id", id);
            return next;
        });
    };

    return (
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 space-y-6">
            <div className="mb-6">
                <h1 className="font-serif text-2xl mb-1">保存したイベント</h1>
                <p className="text-xs text-kakurega-muted">この端末のブラウザに保存されています。</p>
            </div>

            {savedEvents.length === 0 ? (
                <div className="text-center py-20 bg-white/50 rounded-2xl border border-dashed border-black/20">
                    <Star size={48} className="mx-auto text-kakurega-muted/30 mb-4" />
                    <p className="text-sm text-kakurega-muted mb-4">まだ保存されたイベントはありません。</p>
                    <Link
                        to="/search"
                        className="inline-block px-6 py-2 bg-kakurega-green text-white rounded-xl text-xs font-bold hover:bg-kakurega-dark-green transition-colors"
                    >
                        イベントを探しに行く
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedEvents.map((e) => (
                        <Card
                            key={e.id}
                            className="relative group p-0 overflow-hidden flex flex-col cursor-pointer"
                            onClick={() => openDetail(String(e.id))}
                        >
                            {e.imageUrl && (
                                <div className="h-32 w-full overflow-hidden relative">
                                    <img
                                        src={
                                            e.imageUrl
                                                ? `${e.imageUrl}?v=${e.updated_at ?? ""}`
                                                : FALLBACK_IMAGE
                                        }
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        alt={e.title}
                                    />
                                    <div className="absolute inset-0 bg-black/10"></div>
                                </div>
                            )}

                            <div className="p-4 flex-1 flex flex-col">
                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <SaveButton
                                    eventId={e.id}
                                    isSaved={favIds.has(String(e.id))}
                                    setFavIds={setFavIds}
                                    size={10}
                                    className="text-[10px] px-2 py-1 rounded bg-kakurega-paper hover:bg-kakurega-paper-light border border-black/5 text-kakurega-dark-green font-bold"
                                />
                                </div>

                                <h3 className="font-serif font-bold text-lg mb-2 text-kakurega-ink pr-8">
                                    {e.title}
                                </h3>

                                <div className="space-y-1 mb-4">
                                    <div className="flex items-center gap-2 text-xs text-kakurega-muted">
                                        <Calendar size={12} />
                                        <span>{e.date}</span>
                                        <span className="w-px h-3 bg-black/20"></span>
                                        <span>{e.category}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-kakurega-muted">
                                        <MapPin size={12} />
                                        <span>
                                            {e.city}（{e.area}）
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mt-auto pt-3 border-t border-black/5">
                                    <span className="font-bold text-kakurega-green text-sm">
                                        {e.priceYen === 0 ? "無料" : `¥${e.priceYen.toLocaleString()}`}
                                    </span>
                                    <span className="text-[10px] text-kakurega-muted hover:text-kakurega-green flex items-center gap-1">
                                        詳細を見る <ArrowRight size={10} />
                                    </span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SavedPage;
