import React from "react";

type Props = {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
};

export const Card: React.FC<Props> = ({ children, className, onClick }) => {
    return (
        <div
            className={[
                "rounded-2xl border border-black/10 bg-white/80 shadow-sm",
                "p-5",
                onClick ? "cursor-pointer hover:shadow-md transition-shadow" : "",
                className ?? "",
            ].join(" ")}
            onClick={onClick}
        >
            {children}
        </div>
    );
};
