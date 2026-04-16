import type { DbEvent, KakuregaEvent } from "../types/types";
import { coverImageUrl } from "./storage";

const KOBE_CITIES = ["神戸市"];
const HANSHIN_CITIES = ["尼崎市", "西宮市", "芦屋市", "伊丹市", "宝塚市", "川西市", "三田市", "猪名川町"];
const HARIMA_CITIES = [
    "明石市", "加古川市", "高砂市", "稲美町", "播磨町",
    "姫路市", "相生市", "たつの市", "赤穂市", "宍粟市",
    "太子町", "上郡町", "佐用町", "加西市", "加東市",
    "西脇市", "小野市", "三木市", "多可町", "神河町", "福崎町", "市川町"
];
const TANBA_CITIES = ["丹波篠山市", "丹波市"];
const TAJIMA_CITIES = ["豊岡市", "養父市", "朝来市", "香美町", "新温泉町"];
const AWAJI_CITIES = ["洲本市", "南あわじ市", "淡路市"];

function resolveHyogoArea(city?: string | null): string {
    if (!city) return "";
    if (KOBE_CITIES.includes(city)) return "神戸";
    if (HANSHIN_CITIES.includes(city)) return "阪神";
    if (HARIMA_CITIES.includes(city)) return "播磨";
    if (TANBA_CITIES.includes(city)) return "丹波";
    if (TAJIMA_CITIES.includes(city)) return "但馬";
    if (AWAJI_CITIES.includes(city)) return "淡路";
    return "";
}

export function dbToUiEvent(row: DbEvent): KakuregaEvent {
    return {
        id: row.id,
        title: row.title,
        description: row.description ?? "",
        updated_at: row.updated_at,

        category: row.category ?? "",
        city: row.city ?? "",
        area: row.prefecture ?? "",

        date: row.start_date,
        startTime: row.start_time ?? undefined,
        endTime: row.end_time ?? undefined,

        lat: row.latitude ?? 0,
        lng: row.longitude ?? 0,

        prefecture: row.prefecture ?? undefined,
        status: row.status ?? undefined,
        officialUrl: row.official_url ?? undefined,
        contactEmail: row.contact_email ?? undefined,
        contactPhone: row.contact_phone ?? undefined,
        locationName: row.location_name ?? undefined,

        priceYen: row.price_yen ?? 0,
        feeNote: row.fee_note ?? undefined,
        targetAudience: row.target_audience ?? undefined,
        indoorOutdoor: row.indoor_outdoor ?? undefined,
        vibe: row.vibe ?? undefined,
        capacity: row.capacity ?? undefined,
        reservationRequired: row.reservation_required ?? undefined,

        organizer: row.organizer_name ?? undefined,
        tags: row.tags ?? undefined,

        imagePaths: row.image_paths ?? undefined,
        imageUrl: row.image_paths?.[0]
            ? `https://orhsxkwkcqldmhhqzeoq.supabase.co/storage/v1/object/public/event-images/${row.image_paths[0]}`
            : undefined,

        distKm: row.distKm,
    };
}

export { resolveHyogoArea };