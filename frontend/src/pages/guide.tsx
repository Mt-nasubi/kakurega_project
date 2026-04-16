import React from "react";
import { Card } from "../components/Card";

const GuidePage: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-6">
            <div className="text-center">
                <h1 className="font-serif text-2xl mb-2">ご利用ガイド</h1>
                <p className="text-sm text-kakurega-muted">
                    隠れ家の基本的な使い方をご案内します。
                </p>
            </div>

            <Card className="p-6 space-y-3">
                <h2 className="font-bold text-lg text-kakurega-green">1. イベントを探す</h2>
                <p className="text-sm leading-relaxed">
                    検索ページから、地域・日付・ジャンル・予算などの条件でイベントを絞り込めます。
                </p>
            </Card>

            <Card className="p-6 space-y-3">
                <h2 className="font-bold text-lg text-kakurega-green">2. 気になるイベントを保存する</h2>
                <p className="text-sm leading-relaxed">
                    気になったイベントは保存して、あとでまとめて見返せます。
                </p>
            </Card>

            <Card className="p-6 space-y-3">
                <h2 className="font-bold text-lg text-kakurega-green">3. 詳細情報を確認する</h2>
                <p className="text-sm leading-relaxed">
                    イベント詳細から、開催日時・場所・料金・地図などを確認できます。
                </p>
            </Card>

            <Card className="p-6 space-y-3">
                <h2 className="font-bold text-lg text-kakurega-green">4. 主催者の方へ</h2>
                <p className="text-sm leading-relaxed">
                    イベント掲載を希望される方は、掲載方法ページから手順をご確認ください。
                </p>
            </Card>
        </div>
    );
};

export default GuidePage;