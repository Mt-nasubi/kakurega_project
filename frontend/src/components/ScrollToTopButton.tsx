import React, { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

const ScrollToTopButton: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) setIsVisible(true);
            else setIsVisible(false);
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (!isVisible) return null;

    return (
        <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-kakurega-green text-white shadow-xl hover:bg-kakurega-dark-green hover:-translate-y-1 transition-all duration-300 animate-fade-in border-2 border-[#f8f1e3]"
            aria-label="ページトップへ戻る"
        >
            <ArrowUp size={24} />
        </button>
    );
};

export default ScrollToTopButton;
