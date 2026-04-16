import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { ensureProfile, fetchMyProfile } from "./profile";
import { useToast } from "../context/toast";

type Profile = Awaited<ReturnType<typeof fetchMyProfile>>;

type AuthContextValue = {
    user: User | null;
    session: Session | null;
    initializing: boolean;
    profile: Profile;
    refreshProfile: () => Promise<void>;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const withTimeout = async <T,>(p: Promise<T>, ms: number, label: string): Promise<T> => {
    return await Promise.race([
        p,
        new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`${label} timeout (${ms}ms)`)), ms)
        ),
    ]);
};

// 失敗しても少し粘って再試行（Supabase初期化が遅い環境向け）
const retry = async <T,>(
    fn: () => Promise<T>,
    opts: { tries: number; baseDelayMs: number; timeoutMs: number; label: string }
): Promise<T> => {
    const { tries, baseDelayMs, timeoutMs, label } = opts;

    let lastErr: unknown = null;

    for (let i = 0; i < tries; i++) {
        try {
            const res = await withTimeout(fn(), timeoutMs, label);
            return res;
        } catch (e) {
            lastErr = e;
            const delay = baseDelayMs * Math.pow(2, i); // 300,600,1200,...
            console.debug(`[auth] ${label} retry ${i + 1}/${tries} failed -> wait ${delay}ms`, e);
            await sleep(delay);
        }
    }

    throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { showToast } = useToast();

    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile>(null);
    const [initializing, setInitializing] = useState(true);

    const refreshRunningRef = useRef(false);
    const bootedRef = useRef(false);

    const instanceId = useMemo(() => Math.random().toString(36).slice(2), []);

    // 初期化完了を1回だけ
    const finishInitOnce = useRef(false);
    const finishInitializing = () => {
        if (finishInitOnce.current) return;
        finishInitOnce.current = true;
        setInitializing(false);
        console.log("[auth] init done (finishInitializing)");
    };

    // 起動フェーズ：ここが true の間は “復元起因の SIGNED_IN” をトーストしない
    const bootPhaseRef = useRef(true);

    // 手動ログアウトの二重トースト防止
    const manualSignOutRef = useRef(false);

    // トースト多重表示防止（連続イベント対策）
    const lastToastRef = useRef<{ key: string; at: number } | null>(null);
    const toastOnce = (key: string, message: string, type: "success" | "info" | "error" = "success") => {
        const now = Date.now();
        const last = lastToastRef.current;
        if (last && last.key === key && now - last.at < 1500) return;
        lastToastRef.current = { key, at: now };
        showToast({ type, message });
    };

    const refreshProfile = async () => {
        if (refreshRunningRef.current) return;
        refreshRunningRef.current = true;

        try {
            const p = await retry(
                () => fetchMyProfile(),
                { tries: 5, baseDelayMs: 300, timeoutMs: 6000, label: "fetchMyProfile" }
            );
            setProfile(p);
        } catch (e) {
            console.error("[auth] fetchMyProfile failed (final)", e);
            setProfile(null);
        } finally {
            refreshRunningRef.current = false;
        }
    };

    const fireEnsureProfile = () => {
        retry(
            () => ensureProfile(),
            { tries: 5, baseDelayMs: 300, timeoutMs: 6000, label: "ensureProfile" }
        )
            .then(() => console.log("[auth] ensureProfile OK"))
            .catch((e) => console.error("[auth] ensureProfile failed (final)", e));
    };

    const handleSignedIn = async (s: Session) => {
        setSession(s);

        fireEnsureProfile();
        await refreshProfile();
    };

    const handleSignedOut = () => {
        setSession(null);
        setProfile(null);
    };

    useEffect(() => {
        if (bootedRef.current) return;
        bootedRef.current = true;

        let mounted = true;

        console.log("[auth] provider instance", instanceId);
        console.log("[auth] boot");

        // getSessionがハングしてもUIを止めない保険
        const guard = window.setTimeout(() => {
            if (!mounted) return;
            console.debug("[auth] init guard fired (getSession may be stuck)");
            finishInitializing();
        }, 2000);

        const { data: sub } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            console.log("[auth] onAuthStateChange", instanceId, event, { hasSession: !!newSession });
            if (!mounted) return;

            if (event === "INITIAL_SESSION") {
                if (newSession) {
                    void handleSignedIn(newSession);
                } else {
                    handleSignedOut();
                }
                finishInitializing();
                return;
            }
            
            if (event === "SIGNED_IN") {
                if (newSession) {
                    void handleSignedIn(newSession);
                }
            
                if (!bootPhaseRef.current) {
                    toastOnce("signed_in", "ログインしました。", "success");
                }
            
                finishInitializing();
                return;
            }

            if (event === "SIGNED_OUT") {
                handleSignedOut();

                // 手動ログアウト（signOut() 内でトースト済み）ならここでは出さない
                if (manualSignOutRef.current) {
                    manualSignOutRef.current = false;
                } else {
                    // それ以外（期限切れ等）なら出してOK
                    if (!bootPhaseRef.current) {
                        toastOnce("signed_out", "ログアウトしました。", "success");
                    }
                }

                finishInitializing();
                return;
            }

            // その他イベント（TOKEN_REFRESHED / USER_UPDATED など）は基本ノートースト
            if (newSession) {
                setSession(newSession);
            } else {
                setSession(null);
            }
        });

        console.log("[auth] subscribed", instanceId);

        supabase.auth
            .getSession()
            .then(async ({ data, error }) => {
                if (!mounted) return;

                if (error) console.error("[auth] getSession error", error);

                if (data.session) {
                    console.log("[auth] restored session");
                    await handleSignedIn(data.session);
                } else {
                    handleSignedOut();
                }
            })
            .catch((e) => {
                console.debug("[auth] getSession threw", e);
            })
            .finally(() => {
                if (!mounted) return;

                // 起動フェーズ終了：ここから先の SIGNED_IN/SIGNED_OUT は “ユーザー操作扱い”でトースト可
                bootPhaseRef.current = false;

                finishInitializing();
                window.clearTimeout(guard);
            });

        return () => {
            mounted = false;
            window.clearTimeout(guard);
            sub.subscription.unsubscribe();
            console.log("[auth] unsubscribed", instanceId);
        };
    }, [instanceId]);

    const signOut = async () => {
        // onAuthStateChange(SIGNED_OUT) 側で二重表示しないためのフラグ
        manualSignOutRef.current = true;

        const { error } = await supabase.auth.signOut();
        if (error) {
            manualSignOutRef.current = false;
            throw error;
        }

        handleSignedOut();

        // ✅ “ユーザー操作”として必ず出す
        toastOnce("signed_out_manual", "ログアウトしました。", "success");
    };

    const value = useMemo<AuthContextValue>(() => {
        return {
            user: session?.user ?? null,
            session,
            initializing,
            profile,
            refreshProfile,
            signOut,
        };
    }, [session, initializing, profile]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within <AuthProvider />");
    return ctx;
};
