import React from "react";
import { Card } from "../components/Card";

const faqs = [
    {
        q: "会員登録しないと使えませんか？",
        a: "イベント検索や閲覧は会員登録なしでも利用できます。保存機能など一部機能はログインが必要です。",
    },
    {
        q: "掲載情報は常に最新ですか？",
        a: "できる限り最新情報を反映しますが、開催状況や内容の変更については主催者公式情報もご確認ください。",
    },
    {
        q: "イベント掲載をしたいです。",
        a: "イベント掲載方法のページから手順をご確認ください。",
    },
];

const FaqPage: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-4">
            <h1 className="font-serif text-2xl text-center">よくある質問</h1>

            {faqs.map((item, index) => (
                <Card key={index} className="p-6 space-y-2">
                    <h2 className="font-bold text-kakurega-green">Q. {item.q}</h2>
                    <p className="text-sm leading-relaxed">A. {item.a}</p>
                </Card>
            ))}
        </div>
    );
};

export default FaqPage;