import { coverImageUrl } from "./storage";

export const dbToUiEvent = (d: any) => {
    const toHHMM = (t: string | null | undefined) => (t ? String(t).slice(0, 5) : "");

    const image_paths = Array.isArray(d.image_paths)
        ? d.image_paths.map((p: any) => String(p))
        : undefined;

    return {
        id: String(d.id),
        title: d.title ?? "",
        description: d.description ?? "",
        category: d.category ?? "",
        city: d.city ?? "",
        area: d.prefecture ?? "",

        date: d.start_date ?? "",
        startTime: toHHMM(d.start_time),
        endTime: toHHMM(d.end_time),

        lat: (d.latitude ?? null) !== null ? Number(d.latitude) : 34.6937,
        lng: (d.longitude ?? null) !== null ? Number(d.longitude) : 135.1955,

        priceYen: 0,
        organizer: d.organizer_name ?? "",
        tags: d.tags ?? [],

        image_paths,

        imageUrl: coverImageUrl({ image_paths }),
    };
};
