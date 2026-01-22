import React, { useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

const AuthError: React.FC = () => {
    const navigate = useNavigate();
    const [params] = useSearchParams();

    const message = useMemo(() => {
        // AuthCallbackPage から ?message=... を渡す想定（任意）
        const raw = params.get("message");
        return raw ? decodeURIComponent(raw) : "認証の完了に失敗しました。";
    }, [params]);

    const next = useMemo(() => {
        const raw = params.get("next") || "/";
        return raw.startsWith("/") ? raw : "/";
    }, [params]);

    return (
        <div className="max-w-xl mx-auto px-4 py-10">
            <div className="rounded-2xl border bg-white shadow-sm p-6">
                <h1 className="text-xl font-bold">認証に失敗しました</h1>

                <div className="mt-4 text-sm bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3">
                    {message}
                </div>

                <p className="mt-4 text-sm text-slate-600">
                    リンクの有効期限切れや、途中でキャンセルした場合にこの画面になります。
                </p>

                <div className="mt-6 flex flex-col gap-3">
                    <button
                        className="w-full rounded-2xl bg-slate-900 text-white py-3 text-sm font-semibold hover:opacity-90"
                        onClick={() => navigate("/login", { replace: true })}
                    >
                        ログイン画面へ
                    </button>

                    <button
                        className="w-full rounded-2xl border py-3 text-sm font-semibold hover:bg-slate-50"
                        onClick={() => navigate(next, { replace: true })}
                    >
                        元の画面へ戻る
                    </button>

                    <Link
                        className="w-full text-center text-sm text-slate-600 hover:underline"
                        to="/"
                        replace
                    >
                        トップへ
                    </Link>
                </div>

                <div className="mt-5 text-xs text-slate-500">
                    ※ 何度も失敗する場合は、いったんログアウト→再ログイン（またはメール再送）を試してください。
                </div>
            </div>
        </div>
    );
};

export default AuthError;
