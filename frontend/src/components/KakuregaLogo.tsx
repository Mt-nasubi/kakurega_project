import React from "react";

type KakuregaLogoProps = {
    className?: string;
};

const KakuregaLogo: React.FC<KakuregaLogoProps> = ({ className }) => {
    return (
        <svg
            viewBox="0 0 100 100"
            className={className}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Kakurega Logo"
        >
            <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="4"
                className="opacity-90"
            />
            <path
                d="M22 46 Q 50 18 78 46"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M36 46 V 74 H 64 V 46"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinejoin="round"
            />
            <path d="M50 46 V 74" stroke="currentColor" strokeWidth="2.5" />
            <path d="M36 60 H 64" stroke="currentColor" strokeWidth="2.5" />
        </svg>
    );
};

export default KakuregaLogo;
