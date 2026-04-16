import React from "react";
import { Card } from "../components/Card";

const OperatorPage: React.FC = () => (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-6">
        <div className="text-center mb-8">
            <h1 className="font-serif text-2xl mb-2">運営情報</h1>
            <p className="text-xs text-kakurega-muted">
                サービス運営に関する情報を掲載しています。
            </p>
        </div>

        <Card className="p-6 md:p-8">
            <h2 className="font-serif text-xl mb-4 text-kakurega-green border-b border-kakurega-green/20 pb-2 inline-block">
                運営者
            </h2>
            <p className="text-sm leading-loose opacity-90">
                Mt-nasubi
            </p>
        </Card>

    </div>
);

export default OperatorPage;