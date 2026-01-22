/// <reference types="vite/client" />
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

console.log("[supabase] env", { hasUrl: !!supabaseUrl, hasAnonKey: !!supabaseAnonKey });

const safeStorage = {
    getItem: (key: string) => {
        try {
            return window.sessionStorage.getItem(key);
        } catch {
            return null;
        }
    },
    setItem: (key: string, value: string) => {
        try {
            window.sessionStorage.setItem(key, value);
        } catch {
            // noop
        }
    },
    removeItem: (key: string) => {
        try {
            window.sessionStorage.removeItem(key);
        } catch {
            // noop
        }
    },
};

// グローバルに保持して二重生成を防ぐ
const g = globalThis as unknown as { __kakurega_supabase__?: SupabaseClient };

export const supabase =
    g.__kakurega_supabase__ ??
    (g.__kakurega_supabase__ = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            storage: safeStorage,
        },
    }));
