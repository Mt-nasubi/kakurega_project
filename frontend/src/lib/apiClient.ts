import { supabase } from "./supabase";
import type { DbEvent } from "../types/types";

const EVENT_SELECT = `
    id,
    created_at,
    updated_at,
    title,
    description,
    start_date,
    start_time,
    end_date,
    end_time,
    prefecture,
    city,
    category,
    latitude,
    longitude,
    tags,
    status,
    organizer_name,
    official_url,
    contact_email,
    contact_phone,
    image_paths,
    is_public
`;

export async function fetchPublicEvents(): Promise<DbEvent[]> {
    const { data, error } = await supabase
        .from("events")
        .select(EVENT_SELECT)
        .eq("is_public", true)
        .order("start_date", { ascending: true })
        .order("start_time", { ascending: true, nullsFirst: true });

    console.log("fetchPublicEvents DEBUG", { data, error });

    if (error) throw error;
    return (data ?? []) as DbEvent[];
}

export async function fetchEventById(eventId: string): Promise<DbEvent | null> {
    const { data, error } = await supabase
        .from("events")
        .select(EVENT_SELECT)
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
        return new Set();
    }
}

export async function addFavorite(eventId: string): Promise<boolean> {
    try {
        const { data: authData, error: authErr } = await supabase.auth.getUser();
        if (authErr || !authData.user) return false;

        const { error } = await supabase
            .from("favorites")
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
            .from("favorites")
            .delete()
            .eq("user_id", authData.user.id)
            .eq("event_id", eventId);

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
            .select(`events(${EVENT_SELECT})`)
            .eq("user_id", authData.user.id);

        if (error) throw error;

        return (data ?? [])
            .map((row: any) => row.events)
            .filter(Boolean) as DbEvent[];
    } catch {
        return [];
    }
}
