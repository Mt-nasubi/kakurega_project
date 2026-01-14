import { supabase } from "./supabase";
import type { DbEvent } from "../types/types";

export async function fetchPublicEvents(): Promise<DbEvent[]> {
    const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("is_public", true)
        .order("start_at", { ascending: true });

    console.log("fetchPublicEvents DEBUG", { data, error });

    if (error) throw error;
    return (data ?? []) as DbEvent[];
}


export async function fetchEventById(eventId: string): Promise<DbEvent | null> {
    const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .maybeSingle();

    if (error) throw error;
    return (data ?? null) as DbEvent | null;
}

export async function fetchMyFavoriteIds(): Promise<Set<string>> {
    try {
        const { data: authData } = await supabase.auth.getUser();
        if (!authData?.user) return new Set();

        const { data, error } = await supabase
            .from("favorites")
            .select("event_id")
            .eq("user_id", authData.user.id);

        if (error) throw error;

        return new Set((data ?? []).map((r: any) => String(r.event_id)));
    } catch {
        // 未ログイン時(AuthSessionMissingError等)は空で返す
        return new Set();
    }
}

export async function addFavorite(eventId: string): Promise<boolean> {
    try {
        const { data: authData, error: authErr } = await supabase.auth.getUser();

        if (authErr || !authData.user) return false;

        const { error } = await supabase
            .from('favorites')
            .insert({ user_id: authData.user.id, event_id: eventId });

        if (error) throw error;
        return true;
    } catch {
        return false;
    }
}

export async function removeFavorite(eventId: string): Promise<boolean> {
    try {
        const { data: authData, error: authErr } = await supabase.auth.getUser();

        if (authErr || !authData.user) return false;

        const { error } = await supabase
            .from('favorites')
            .delete()
            .eq('user_id', authData.user.id)
            .eq('event_id', eventId);

        if (error) throw error;
        return true;
    } catch {
        return false;
    }
}

export async function fetchMyFavoriteEvents(): Promise<DbEvent[]> {
    try {
        const { data: authData } = await supabase.auth.getUser();
        if (!authData?.user) return [];

        const { data, error } = await supabase
            .from("favorites")
            .select("events(*)")
            .eq("user_id", authData.user.id);

        if (error) throw error;

        return (data ?? [])
            .map((row: any) => row.events)
            .filter(Boolean) as DbEvent[];
    } catch {
        // 未ログイン時(AuthSessionMissingError等)は空で返す
        return [];
    }
}
