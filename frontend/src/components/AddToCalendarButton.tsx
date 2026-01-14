import React, { useMemo } from "react";
import { CalendarPlus } from "lucide-react";
import type { KakuregaEvent } from "../types/types";

const AddToCalendarButton: React.FC<{
    event: KakuregaEvent;
    className?: string;
    children?: React.ReactNode;
}> = ({ event, className, children }) => {
    const googleCalendarUrl = useMemo(() => {
        const title = encodeURIComponent(event.title);
        const location = encodeURIComponent(`${event.city} ${event.area}`);
        const details = encodeURIComponent(event.description || "");
        const dateStr = event.date.replace(/-/g, "");
        const start = event.startTime ? event.startTime.replace(":", "") : "1000";
        const end = event.endTime ? event.endTime.replace(":", "") : "1200";
        const dates = `${dateStr}T${start}00/${dateStr}T${end}00`;

        return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}&ctz=Asia/Tokyo`;
    }, [event]);

    return (
        <a
            href={googleCalendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={
                className ||
                "flex items-center gap-1.5 text-[10px] font-bold text-kakurega-muted bg-kakurega-paper hover:bg-kakurega-paper-light border border-black/10 px-3 py-1.5 rounded-full transition-colors"
            }
            onClick={(e) => e.stopPropagation()}
        >
            {children ? (
                children
            ) : (
                <>
                    <CalendarPlus size={16} />
                    予定に追加
                </>
            )}
        </a>
    );
};

export default AddToCalendarButton;
