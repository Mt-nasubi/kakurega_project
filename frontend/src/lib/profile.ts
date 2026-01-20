import { supabase } from "./supabase";

export type Profile = {
    id: string;
    email: string | null;
    display_name: string | null;
    notify_enabled: boolean;
    created_at: string;
    updated_at: string;
};


    export const ensureProfile = async (): Promise<void> => {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

    const user = sessionData.session?.user;
    if (!user) return;

    // ★ Auth の metadata から拾う（Signupで options.data に入れたやつ）
    const displayName =
        (user.user_metadata?.display_name as string | undefined) ??
        (user.email ? user.email.split("@")[0] : null);


    const { data: existing, error: selectError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

    if (selectError) throw selectError;

    const { data: check, error: checkError } = await supabase
        .from("profiles")
        .select("id, email, display_name, created_at, updated_at")
        .eq("id", user.id)
        .maybeSingle();

    if (!existing) {
        const { error: upsertError } = await supabase.from("profiles").upsert(
            {
                id: user.id,
                email: user.email ?? null,
                display_name: displayName,
            },
            { onConflict: "id" }
        );

        if (upsertError) throw upsertError;
    }
};

export const fetchMyProfile = async (): Promise<Profile | null> => {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) return null;

    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    if (error) throw error;
    return data as Profile;
};

export const updateMyProfile = async (
    patch: Partial<Pick<Profile, "display_name" | "notify_enabled">>
): Promise<void> => {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
        .from("profiles")
        .update(patch)
        .eq("id", user.id);

    if (error) throw error;
};

