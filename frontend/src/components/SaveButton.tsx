import React, { useState } from "react";
import { Star } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

import { useAuth } from "../lib/auth";
import { useToast } from "../context/toast";
import { addFavorite, removeFavorite } from "../lib/apiClient";

type Props = {
    eventId: string;
    isSaved: boolean;
    setFavIds: React.Dispatch<React.SetStateAction<Set<string>>>;
    size?: number;
    className?: string;
};

const SaveButton: React.FC<Props> = ({
    eventId,
    isSaved,
    setFavIds,
    size = 12,
    className = "",
}) => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const [pending, setPending] = useState(false);

    const handleClick = async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (pending) return;

        const id = String(eventId);

        if (!user) {
            showToast({ type: "info", message: "お気に入りにはログインが必要です" });
            const next = `${location.pathname}${location.search}`;
            navigate(`/require-login?next=${encodeURIComponent(next)}`);
            return;
        }

        setPending(true);

        try {
            if (isSaved) {
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
        } finally {
            setPending(false);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={pending}
            className={`flex items-center gap-1 ${className} ${
                pending ? "opacity-60 pointer-events-none" : ""
            }`}
        >
            <Star
                size={size}
                className={isSaved ? "fill-current" : ""}
            />
            <span>
                {isSaved ? "保存済み" : "保存"}
            </span>
        </button>
    );
};

export default SaveButton;