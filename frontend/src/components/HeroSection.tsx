import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Info, Search as SearchIcon } from "lucide-react";
import { coverImageUrl } from "../lib/storage";

const HeroSection: React.FC<{ events: any[] }> = ({ events }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);

    const images = useMemo(() => {
        const unique = Array.from(new Set(events.map((e) => coverImageUrl(e)))) as string[];
        return unique.slice(0, 5);
    }, [events]);

    useEffect(() => {
        setIsLoaded(true);
        if (images.length === 0) return;

        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }, 6000);

        return () => clearInterval(interval);
    }, [images.length]);

    return (
        <section className="relative w-full h-[500px] md:h-[600px] rounded-b-[40px] overflow-hidden shadow-xl mb-10 group">
            {images.map((img, index) => (
                <div
                    key={img}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? "opacity-100" : "opacity-0"}`}
                >
                    <div className="absolute inset-0 bg-black/40 z-10" />
                    <img
                        src={`${img}?t=${index}`}
                        alt="Hero background"
                        className={`w-full h-full object-cover transition-transform duration-[10s] ease-linear ${index === currentImageIndex ? "scale-110" : "scale-100"}`}
                    />
                </div>
            ))}

            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent z-20" />

            <div className={`relative z-30 h-full flex flex-col justify-center px-6 md:px-16 max-w-4xl transition-all duration-1000 transform ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
                <div className="mb-6 flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] tracking-widest uppercase font-bold">
                        Welcome to Kakurega
                    </span>
                    <div className="h-px w-12 bg-white/40"></div>
                </div>

                <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.2] mb-6 drop-shadow-lg tracking-wide">
                    見つかる、<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-kakurega-green to-[#a3d9a5]">
                        まだ見ぬ日常
                    </span>
                    の<br />
                    とっておき。
                </h1>

                <p className="text-white/80 text-sm md:text-lg leading-relaxed max-w-xl mb-10 font-medium tracking-wide border-l-2 border-kakurega-green pl-6">
                    観光地ではない、あなたの生活圏にある「隠れ家」のようなイベントたち。<br className="hidden md:block" />
                    週末は少し足を延ばして、新しいお気に入りを探しに行きませんか？
                </p>

                <div className="flex flex-wrap gap-4">
                    <Link
                        to="/search"
                        className="group relative px-8 py-4 bg-kakurega-green text-white rounded-full font-bold shadow-[0_0_20px_rgba(14,107,42,0.4)] hover:shadow-[0_0_30px_rgba(14,107,42,0.6)] hover:bg-kakurega-dark-green transition-all duration-300 flex items-center gap-3 overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            <SearchIcon size={20} />
                            今すぐ探す
                        </span>
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    </Link>

                    <Link
                        to="/about"
                        className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full font-bold hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
                    >
                        <Info size={20} />
                        Kakuregaとは
                    </Link>
                </div>
            </div>

            {images.length > 0 && (
                <div className="absolute bottom-8 right-8 md:right-16 z-30 flex gap-3">
                    {images.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentImageIndex ? "w-12 bg-kakurega-green" : "w-3 bg-white/30 hover:bg-white/50"}`}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};

export default HeroSection;
