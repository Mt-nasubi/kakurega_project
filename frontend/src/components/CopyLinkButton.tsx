import React, { useState } from "react";
import { Check, Link as LinkIcon } from "lucide-react";

const CopyLinkButton: React.FC<{
    eventId: string;
    className?: string;
    children?: React.ReactNode | ((copied: boolean) => React.ReactNode);
}> = ({ eventId, className, children }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        const url = `${window.location.origin}${window.location.pathname}#/search?event_id=${encodeURIComponent(eventId)}`;
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 3500);
        });
    };

    return (
        <button
            onClick={handleCopy}
            className={
                className ||
                "bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-md transition-colors z-10"
            }
            title="リンクをコピー"
        >
            {typeof children === "function"
                ? children(copied)
                : children
                    ? children
                    : className
                        ? (
                            <span className="flex items-center gap-1.5">
                                {copied ? <Check size={14} /> : <LinkIcon size={14} />}
                                {copied ? "コピー完了" : "リンク"}
                            </span>
                        )
                        : copied
                            ? <Check size={24} className="text-kakurega-green" />
                            : <LinkIcon size={24} />}
        </button>
    );
};

export default CopyLinkButton;
