import React from "react";
import { Card } from "../components/Card";

const ContactPage: React.FC = () => {
    return (
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
            <Card className="p-6 md:p-8 space-y-4">
                <h1 className="font-serif text-2xl">お問い合わせ</h1>
                <p className="text-sm text-kakurega-muted leading-relaxed">
                    サービスに関するご意見・ご質問・不具合報告は、以下までご連絡ください。
                </p>

                <div className="space-y-2 text-sm">
                    <p>メールアドレス：support@example.com</p>
                    <p>対応時間：平日 10:00〜18:00</p>
                </div>

                <p className="text-xs text-kakurega-muted leading-relaxed">
                    ※ 仮情報
                </p>
            </Card>
        </div>
    );
};

export default ContactPage;