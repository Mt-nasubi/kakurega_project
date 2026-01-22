// src/context/toast.tsx
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastType = "success" | "info" | "error";

export type ToastPayload = {
    type: ToastType;
    message: string;
    durationMs?: number;
};

type ToastItem = ToastPayload & {
    id: string;
};

type ToastContextValue = {
    showToast: (payload: ToastPayload) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const showToast = useCallback((payload: ToastPayload) => {
        const id = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const durationMs = payload.durationMs ?? 2500;

        const item: ToastItem = {
            id,
            type: payload.type,
            message: payload.message,
            durationMs,
        };

        // 「同じ場所で上書き」したいなら、ここを “最新1件だけ” にする
        setToasts([item]);

        window.setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, durationMs);
    }, []);

    const value = useMemo<ToastContextValue>(() => ({ showToast }), [showToast]);

    return (
        <ToastContext.Provider value={value}>
            {children}

            {/* Toast UI */}
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-[min(92vw,520px)]">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={`
                            mb-2 rounded-2xl border px-4 py-3 shadow-md
                            backdrop-blur bg-white/80
                            ${t.type === "success" ? "border-emerald-200 text-emerald-900" : ""}
                            ${t.type === "info" ? "border-sky-200 text-sky-900" : ""}
                            ${t.type === "error" ? "border-red-200 text-red-900" : ""}
                        `}
                    >
                        <div className="text-sm font-bold">{t.message}</div>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = (): ToastContextValue => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used within <ToastProvider />");
    return ctx;
};
