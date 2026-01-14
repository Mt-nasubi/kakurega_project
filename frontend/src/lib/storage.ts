import { supabase } from "./supabase";

export const publicImageUrl = (path: string) => {
    const { data } = supabase.storage.from("event-images").getPublicUrl(path);
    return data.publicUrl;
};

export const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1528360983277-13d9b152c611?auto=format&fit=crop&q=80";

export const coverImageUrl = (e: { image_paths?: string[] | null }) => {
    const p = e.image_paths?.[0];
    return p ? publicImageUrl(p) : FALLBACK_IMAGE;
};
