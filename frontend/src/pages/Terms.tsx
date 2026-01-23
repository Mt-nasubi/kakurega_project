import React from "react";

const TermsPage: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-10">
            <h1 className="text-2xl font-bold text-kakurega-ink mb-6">
                利用規約
            </h1>

            <div className="space-y-4 text-sm text-kakurega-ink leading-relaxed">
                <p>
                    （ここに利用規約本文が入ります）
                </p>

                <p>
                    本ページの内容は後日更新されます。
                </p>
            </div>
        </div>
    );
};

export default TermsPage;
