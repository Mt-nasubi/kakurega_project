import React, { useEffect, useState } from "react";
import { ArrowRight, Filter } from "lucide-react";
import { Link } from "react-router-dom";

import type { KakuregaEvent } from "../types/types";
import Card from "../components/Card";
import HeroSection from "../components/HeroSection";
import RichEventCard from "../components/RichEventCard";

const HomePage: React.FC<{ events: any[]; eventsLoading: boolean }> = ({ events }) => {
    const [randomPicks, setRandomPicks] = useState<KakuregaEvent[]>([]);

    useEffect(() => {
        const shuffled = [...events].sort(() => 0.5 - Math.random());
        setRandomPicks(shuffled.slice(0, 3));
        console.log("events state updated", events.length, events);
    }, [events]);

    return (
        <div className="pb-10">
            <HeroSection events={events} />

            <div className="max-w-5xl mx-auto px-4 md:px-6 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { title: "探しやすさ", desc: "キーワード入力不要。直感的な選択で、迷わず目的のイベントへ。" },
                        { title: "生活圏ファースト", desc: "行政区切りではなく「行ける距離」で。隣町の魅力も発見できます。" },
                        { title: "保存して計画", desc: "気になったらワンタップで保存。週末の予定作りをスムーズに。" },
                    ].map((item, i) => (
                        <Card key={i} className="hover:bg-white transition-colors">
                            <h2 className="text-sm font-bold mb-2 text-kakurega-green font-serif">
                                {item.title}
                            </h2>
                            <p className="text-xs leading-relaxed opacity-70">{item.desc}</p>
                        </Card>
                    ))}
                </div>

                <section>
                    <div className="flex justify-between items-end mb-6 px-1">
                        <div>
                            <h2 className="font-serif text-2xl text-kakurega-ink font-bold mb-1">
                                おすすめのイベント
                            </h2>
                            <p className="text-xs text-kakurega-muted">
                                あなたの街の近くで見つかる、特別な体験
                            </p>
                        </div>
                        <Link
                            to="/search"
                            className="text-xs font-bold text-kakurega-green hover:text-kakurega-dark-green flex items-center gap-1 group"
                        >
                            すべて見る{" "}
                            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {randomPicks.map((e) => (
                            <RichEventCard key={e.id} event={e} />
                        ))}
                    </div>

                    <div className="mt-10 text-center">
                        <p className="text-xs text-kakurega-muted mb-4">
                            条件を指定して、もっと探してみませんか？
                        </p>
                        <Link
                            to="/search"
                            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-kakurega-green border-2 border-kakurega-green rounded-xl text-sm font-bold shadow-sm hover:bg-kakurega-green hover:text-white transition-colors"
                        >
                            <Filter size={16} />
                            詳細検索ページへ
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default HomePage;
