import React from "react";

const ResetPasswordPage: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-10">
            <h1 className="text-center font-serif text-2xl font-bold text-kakurega-ink mb-8">
                パスワード再設定
            </h1>

            <div className="bg-white/80 border border-black/10 rounded-3xl shadow-sm overflow-hidden">
                <div className="p-6 md:p-10 space-y-4">
                    <p className="text-sm text-kakurega-muted leading-relaxed">
                        （ここにパスワード再設定の画面が入ります）
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
