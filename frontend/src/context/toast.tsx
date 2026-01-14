import React from "react";

export type ToastType = "success" | "info" | "error";

export type ToastContextType = {
    pushToast: (
        message: string,
        type?: ToastType,
        action?: { label: string; onClick: () => void }
    ) => void;
};

export const ToastContext = React.createContext<ToastContextType | null>(null);

export const useToast = () => {
    const ctx = React.useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used within ToastContext");
    return ctx;
};
