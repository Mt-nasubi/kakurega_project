import React from "react";
import { Card } from "../components/Card";

const AboutPage: React.FC = () => (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-6">
        <div className="text-center mb-8">
            <h1 className="font-serif text-2xl mb-2">企業について</h1>
            <p className="text-xs text-kakurega-muted">
                地域の小規模イベントの発見性向上を目指すプロトタイプです。
            </p>
        </div>

        {[
            {
                t: "目的",
                c: "市町村単位で分散しがちなイベント情報を、県内で横断的に探せる形に整え、生活圏ベースでの探索を可能にします。",
            },
            {
                t: "UI方針",
                c: "キーワード入力に頼らず、タイプ・予算・期間・距離・地区といった選択式で探せる構成にします。和風の落ち着いた色合い（深緑・生成り・墨色）で、視認性と雰囲気を両立します。",
            },
            {
                t: "注意",
                c: "本ページは研究・開発用のサンプルであり、掲載情報の正確性や開催可否を保証するものではありません。",
            },
        ].map((s, i) => (
            <Card key={i} className="p-6 md:p-8">
                <h2 className="font-serif text-xl mb-4 text-kakurega-green border-b border-kakurega-green/20 pb-2 inline-block">
                    {s.t}
                </h2>
                <p className="text-sm leading-loose opacity-90 text-justify">{s.c}</p>
            </Card>
        ))}
    </div>
);

export default AboutPage;
