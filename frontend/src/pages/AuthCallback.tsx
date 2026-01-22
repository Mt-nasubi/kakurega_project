// src/pages/AuthCallbackPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

const AuthCallbackPage: React.FC = () => {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const run = async () => {
            try {
                const code = params.get("code");
                const next = params.get("next") || "/";

                if (!code) {
                    throw new Error("認証コードが見つかりません。");
                }

                const { error } = await supabase.auth.exchangeCodeForSession(code);
                if (error) {
                    throw error;
                }

                const safeNext = next.startsWith("/") ? next : "/";

                navigate(
                    `/auth/success?next=${encodeURIComponent(safeNext)}`,
                    { replace: true }
                );
            } catch (e: any) {
                const message =
                    e?.message ?? "認証の完了に失敗しました。";

                navigate(
                    `/auth/error?message=${encodeURIComponent(message)}`,
                    { replace: true }
                );
            }
        };

        run();
    }, [navigate, params]);

    return (
        <div className="max-w-xl mx-auto px-4 py-10">
            <h1 className="text-xl font-bold">ログイン処理中...</h1>
            {error && (
                <div className="mt-4 text-sm bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3">
                    {error}
                </div>
            )}
        </div>
    );
};

export default AuthCallbackPage;