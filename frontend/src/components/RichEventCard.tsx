import React, { useMemo } from "react";
import { Clock, MapPin, User, Star } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import type { KakuregaEvent } from "../types/types";
import CopyLinkButton from "./CopyLinkButton";
import AddToCalendarButton from "./AddToCalendarButton";
import SaveButton from "./SaveButton";
import { FALLBACK_IMAGE } from "../lib/storage";

const RichEventCard: React.FC<{ event: KakuregaEvent }> = ({ event }) => {
    const [, setSearchParams] = useSearchParams();

    const [month, day] = useMemo(() => {
        const d = new Date(event.date);
        return [d.getMonth() + 1, d.getDate()];
    }, [event.date]);

    const openDetail = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set("event_id", event.id);
            return next;
        });
    };

    return (
        <div
            onClick={openDetail}
            className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-black/5 cursor-pointer flex flex-col h-full relative"
        >
            <div className="relative h-48 overflow-hidden">
                <img
                    src={event.imageUrl || FALLBACK_IMAGE}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>

                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-lg shadow-md p-1.5 text-center min-w-[50px] font-serif border border-black/5">
                    <span className="block text-[10px] font-bold text-kakurega-muted leading-none mb-0.5">
                        {month}月
                    </span>
                    <span className="block text-xl font-bold text-kakurega-green leading-none">
                        {day}
                    </span>
                </div>

                <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded-full bg-kakurega-green/90 backdrop-blur-sm text-white text-[10px] font-medium shadow-sm">
                        {event.category}
                    </span>
                </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
                {event.tags && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {event.tags.map((tag) => (
                            <span
                                key={tag}
                                className="text-[10px] text-kakurega-muted bg-kakurega-paper px-2 py-0.5 rounded-md"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                <h3 className="font-serif text-lg font-bold text-kakurega-ink mb-3 leading-snug group-hover:text-kakurega-green transition-colors">
                    {event.title}
                </h3>

                <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-kakurega-muted">
                        <Clock size={12} className="text-kakurega-green" />
                        <span>
                            {event.startTime} - {event.endTime}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-kakurega-muted">
                        <MapPin size={12} className="text-kakurega-green" />
                        <span>
                            {event.city} ({event.area})
                        </span>
                    </div>

                    {event.organizer && (
                        <div className="flex items-center gap-2 text-xs text-kakurega-muted">
                            <User size={12} className="text-kakurega-green" />
                            <span className="truncate">主催: {event.organizer}</span>
                        </div>
                    )}
                </div>

                <p className="text-xs text-kakurega-muted/80 line-clamp-2 mb-5 flex-1 leading-relaxed">
                    {event.description}
                </p>

                <div className="pt-4 border-t border-black/5 flex items-center justify-between mt-auto">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-kakurega-muted mb-0.5">参加費</span>
                        <span className="font-bold text-kakurega-green text-sm">
                            {event.priceYen === 0 ? "無料" : `¥${event.priceYen.toLocaleString()}`}
                        </span>
                    </div>

                    <div className="flex gap-2">
                        <SaveButton
                            eventId={event.id}
                            isSaved={false}
                            setFavIds={() => {}}
                            size={10}
                            className="text-[10px] px-2 py-1 rounded bg-kakurega-paper hover:bg-kakurega-paper-light border border-black/5 flex items-center gap-1 text-kakurega-dark-green font-bold"
                        />
                        <AddToCalendarButton event={event} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RichEventCard;
