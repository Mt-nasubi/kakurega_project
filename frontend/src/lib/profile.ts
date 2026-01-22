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

    const displayNameFromAuth =
        (user.user_metadata?.display_name as string | undefined) ??
        (user.email ? user.email.split("@")[0] : null);

    const { data: existing, error: selectError } = await supabase
        .from("profiles")
        .select("id, email, display_name, notify_enabled")
        .eq("id", user.id)
        .maybeSingle();

    if (selectError) throw selectError;

    if (!existing) {
        const { error: upsertError } = await supabase
            .from("profiles")
            .upsert(
                {
                    id: user.id,
                    email: user.email ?? null,
                    display_name: displayNameFromAuth,
                },
                { onConflict: "id" }
            );

        if (upsertError) throw upsertError;
        return;
    }

    const patch: Partial<Pick<Profile, "email" | "display_name">> = {};

    if (!existing.email && user.email) {
        patch.email = user.email;
    }

    const currentName = (existing.display_name ?? "").trim();
    if (!currentName && displayNameFromAuth) {
        patch.display_name = displayNameFromAuth;
    }

    if (Object.keys(patch).length === 0) return;

    const { error: updateError } = await supabase
        .from("profiles")
        .update(patch)
        .eq("id", user.id);

    if (updateError) throw updateError;
};

export const fetchMyProfile = async (): Promise<Profile | null> => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;

    const user = sessionData.session?.user;
    if (!user) return null;

    console.log("[profile] fetchMyProfile start", { userId: user.id });

    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

    console.log("[profile] fetchMyProfile result", { hasData: !!data, error });

    if (error) throw error;
    return (data ?? null) as Profile | null;
};

export const updateMyProfile = async (
    patch: Partial<Pick<Profile, "display_name" | "notify_enabled">>
): Promise<void> => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;

    const user = sessionData.session?.user;
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
        .from("profiles")
        .update(patch)
        .eq("id", user.id);

    if (error) throw error;
};
