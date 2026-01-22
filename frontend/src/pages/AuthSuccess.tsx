import React, { useEffect, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

const AuthSuccess: React.FC = () => {
    const navigate = useNavigate();
    const [params] = useSearchParams();

    const next = useMemo(() => {
        const raw = params.get("next") || "/";
        return raw.startsWith("/") ? raw : "/";
    }, [params]);

    useEffect(() => {
        // もしセッションが無い状態でこのページに来たら、トップへ戻す（安全策）
        const run = async () => {
            const { data } = await supabase.auth.getSession();
            if (!data.session) {
                navigate("/", { replace: true });
            }
        };
        run();
    }, [navigate]);

    return (
        <div className="max-w-xl mx-auto px-4 py-10">
            <div className="rounded-2xl border bg-white shadow-sm p-6">
                <h1 className="text-xl font-bold">認証が完了しました</h1>
                <p className="mt-2 text-sm text-slate-600">
                    ログイン状態になりました。続けて次の画面へ進めます。
                </p>

                <div className="mt-6 flex flex-col gap-3">
                    <button
                        className="w-full rounded-2xl bg-slate-900 text-white py-3 text-sm font-semibold hover:opacity-90"
                        onClick={() => navigate(next, { replace: true })}
                    >
                        続ける
                    </button>

                    <Link
                        className="w-full rounded-2xl border py-3 text-sm font-semibold text-center hover:bg-slate-50"
                        to="/"
                        replace
                    >
                        トップへ
                    </Link>
                </div>

                <div className="mt-5 text-xs text-slate-500">
                    ※ もし画面が進まない場合は、ページを再読み込みするか、再度ログインをお試しください。
                </div>
            </div>
        </div>
    );
};

export default AuthSuccess;
