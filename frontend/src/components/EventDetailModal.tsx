import React, { useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Calendar, MapPin, User, Tag, Star, X, CalendarPlus, Check, Link as LinkIcon } from "lucide-react";

import type { KakuregaEvent } from "../types/types";
import { useToast } from "../context/toast";
import { addFavorite, removeFavorite } from "../lib/apiClient";
import { useAuth } from "../lib/auth";
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
    const { showToast } = useToast();
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const toggleSave = async () => {
        const id = String(eventId);
        const isFav = favIds.has(id);

        if (!user) {
            const next = `${location.pathname}${location.search}`;
            navigate(`/require-login?next=${encodeURIComponent(next)}`);
            return;
        }

        try {
            if (isFav) {
                const ok = await removeFavorite(id);

                if (!ok) {
                    showToast({ type: "error", message: "削除に失敗しました" });
                    return;
                }

                setFavIds((prev) => {
                    const next = new Set(prev);
                    next.delete(id);
                    return next;
                });

                showToast({ type: "info", message: "お気に入りから削除しました" });
            } else {
                const ok = await addFavorite(id);

                if (!ok) {
                    showToast({ type: "error", message: "保存に失敗しました" });
                    return;
                }

                setFavIds((prev) => {
                    const next = new Set(prev);
                    next.add(id);
                    return next;
                });

                showToast({ type: "success", message: "保存しました" });
            }
        } catch {
            showToast({ type: "error", message: "保存に失敗しました" });
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

                    <button
                        onClick={toggleSave}
                        className="absolute bottom-4 right-4 z-10 bg-white/90 hover:bg-white text-kakurega-ink rounded-full px-4 py-2 flex items-center gap-2 shadow-lg transition-colors"
                    >
                        <Star size={18} className={isSaved ? "fill-current" : ""} />
                        <span className="text-sm font-medium">
                            {isSaved ? "保存済み" : "保存する"}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventDetailModal;