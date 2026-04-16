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

export const dbToUiEvent = (d: DbEvent): KakuregaEvent => {
    const toHHMM = (t: string | null | undefined) => (t ? String(t).slice(0, 5) : "");

    const imagePaths = Array.isArray(d.image_paths)
        ? d.image_paths.map((p) => String(p))
        : [];

    return {
        id: String(d.id),
        title: d.title ?? "",
        description: d.description ?? "",
        category: d.category ?? "",
        city: d.city ?? "",
        area: resolveHyogoArea(d.city),

        date: d.start_date ?? "",
        startTime: toHHMM(d.start_time),
        endTime: toHHMM(d.end_time),

        lat: d.latitude != null ? Number(d.latitude) : 34.6937,
        lng: d.longitude != null ? Number(d.longitude) : 135.1955,

        prefecture: d.prefecture ?? "",
        status: d.status ?? "",
        officialUrl: d.official_url ?? "",
        contactEmail: d.contact_email ?? "",
        contactPhone: d.contact_phone ?? "",
        locationName: d.location_name ?? "",

        priceYen: d.price_yen ?? 0,
        organizer: d.organizer_name ?? "",
        tags: d.tags ?? [],

        imagePaths,
        imageUrl: coverImageUrl({ imagePaths }),
    };
};

export { resolveHyogoArea };