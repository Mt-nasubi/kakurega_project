import React from "react";
import { Card } from "../components/Card";

const sections = [
    {
        t: "このサイトについて",
        c: "隠れ家は、地域にある小規模なイベントや、普段は見つけにくい催しを探しやすくするためのイベント検索サービスです。観光向けの大規模イベントだけでなく、生活圏の中にある身近な楽しみと出会える場を目指しています。",
    },
    {
        t: "できること",
        c: "地域・日付・ジャンルなどの条件からイベントを探し、気になるイベントを保存できます。検索しやすさを重視し、キーワード入力に頼りすぎない、選択しやすい画面構成を目指しています。",
    },
    {
        t: "掲載情報について",
        c: "掲載している情報は、できる限り正確な内容を表示できるよう努めていますが、日時・料金・開催可否などが変更される場合があります。参加前には、主催者の公式案内もあわせてご確認ください。",
    },
    {
        t: "ご利用にあたって",
        c: "本サービスは現在開発中の段階を含むため、機能や表示内容が変更されることがあります。今後も、地域イベントを探しやすく、使いやすいサービスになるよう改善を進めていきます。",
    },
];

const AboutPage: React.FC = () => (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-6">
        <div className="text-center mb-8">
            <h1 className="font-serif text-2xl mb-2">このサイトについて</h1>
            <p className="text-xs text-kakurega-muted">
                地域のイベントを、もっと見つけやすくするためのサービスです。
            </p>
        </div>

        {sections.map((section, index) => (
            <Card key={index} className="p-6 md:p-8">
                <h2 className="font-serif text-xl mb-4 text-kakurega-green border-b border-kakurega-green/20 pb-2 inline-block">
                    {section.t}
                </h2>
                <p className="text-sm leading-loose opacity-90 text-justify">
                    {section.c}
                </p>
            </Card>
        ))}
    </div>
);

export default AboutPage;