import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { ensureProfile, fetchMyProfile } from "./profile";

type AuthContextValue = {
    user: User | null;
    session: Session | null;
    initializing: boolean;
    profile: Awaited<ReturnType<typeof fetchMyProfile>>;
    refreshProfile: () => Promise<void>;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [initializing, setInitializing] = useState(true);
    const [profile, setProfile] = useState<Awaited<ReturnType<typeof fetchMyProfile>>>(null);

    const refreshProfile = async () => {
        try {
            const p = await fetchMyProfile();
            setProfile(p);
        } catch (e) {
            console.error("fetchMyProfile failed", e);
            setProfile(null);
        }
    };

    useEffect(() => {
        let isMounted = true;

        const init = async () => {
            try {
                const { data, error } = await supabase.auth.getSession();
                if (!isMounted) return;

                if (error) console.error("getSession error", error);

                setSession(data.session ?? null);
                setInitializing(false);

                if (data.session?.user) {
                    try {
                        await ensureProfile();
                    } catch (e) {
                        console.error("ensureProfile failed (init)", e);
                    }
                    await refreshProfile();
                } else {
                    setProfile(null);
                }
            } catch (e) {
                if (!isMounted) return;
                console.error("getSession exception", e);
                setInitializing(false);
            }
        };

        init();

        const { data } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
            if (!isMounted) return;

            setSession(newSession ?? null);

            if (newSession?.user) {
                try {
                    await ensureProfile();
                } catch (e) {
                    console.error("ensureProfile failed (onAuthStateChange)", e);
                }
                await refreshProfile();
            } else {
                setProfile(null);
            }
        });

        return () => {
            isMounted = false;
            data.subscription.unsubscribe();
        };
    }, []);

    const value = useMemo<AuthContextValue>(() => {
        return {
            user: session?.user ?? null,
            session,
            initializing,
            profile,
            refreshProfile,
            signOut: async () => {
                await supabase.auth.signOut();
            },
        };
    }, [session, initializing, profile]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within <AuthProvider />");
    return ctx;
};
