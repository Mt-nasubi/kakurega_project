import React from "react";
import { X } from "lucide-react";
import type { ToastType } from "../context/toast";

export type ToastItem = {
    id: string;
    message: string;
    type: ToastType;
    actionLabel?: string;
    onAction?: () => void;
};

const ToastHost: React.FC<{ toast: ToastItem | null; onClose: () => void }> = ({
    toast,
    onClose,
}) => {
    if (!toast) return null;

    const borderClass =
        toast.type === "success"
            ? "border-kakurega-green/30"
            : toast.type === "error"
                ? "border-red-300"
                : "border-black/10";

    const icon = toast.type === "success" ? "✓" : toast.type === "error" ? "!" : "i";

    return (
        <div className="fixed top-[1.2cm] left-1/2 -translate-x-1/2 z-[120]">
            <div
                className={[
                    "w-[min(520px,92vw)]",
                    "rounded-2xl px-4 py-3 shadow-xl border",
                    "bg-white/70 backdrop-blur-md",
                    "animate-fade-in",
                    borderClass,
                ].join(" ")}
            >
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-black/5 flex items-center justify-center text-xs font-bold">
                            {icon}
                        </div>
                        <p className="text-sm font-bold text-kakurega-ink leading-relaxed">
                            {toast.message}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {toast.actionLabel && toast.onAction && (
                            <button
                                onClick={() => {
                                    toast.onAction?.();
                                    onClose();
                                }}
                                className="px-3 py-1.5 rounded-full text-xs font-bold bg-kakurega-green text-white hover:bg-kakurega-dark-green transition-colors"
                            >
                                {toast.actionLabel}
                            </button>
                        )}

                        <button
                            onClick={onClose}
                            className="text-kakurega-muted hover:text-kakurega-ink transition-colors"
                            aria-label="閉じる"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ToastHost;
export type { ToastType };
