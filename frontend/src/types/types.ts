// types.ts

// ==============================
// DB rows (Supabase)
// ==============================
export type DbEvent = {
    id: string; // uuid -> string
    created_at: string;
    updated_at: string;

    title: string;
    description: string | null;

    // --- 分割後の開催日時 ---
    start_date: string;           // "YYYY-MM-DD"
    start_time: string | null;    // "HH:MM:SS" or null
    end_date: string | null;      // "YYYY-MM-DD" or null
    end_time: string | null;      // "HH:MM:SS" or null

    // --- 住所/分類 ---
    prefecture: string | null;
    city: string | null;
    category: string | null;

    // --- 地図 ---
    latitude: number | null;
    longitude: number | null;

    // --- メタ ---
    status: string | null;              // 'scheduled' | 'ended' | 'canceled' など
    organizer_name: string | null;
    official_url: string | null;
    contact_email: string | null;
    contact_phone: string | null;

    // --- タグ/画像 ---
    tags: string[] | null;              // text[] -> string[]
    image_paths: string[] | null;        // text[] -> string[]

    is_public: boolean;

        // 距離フィルタ時に付く
    distKm?: number;
};

// ==============================
// UI model
// ==============================
export type KakuregaEventStatus = 'scheduled' | 'ended' | 'canceled';

export type KakuregaEvent = {
    id: string;

    title: string;
    description?: string;

    // UIで使ってる
    category: string;
    city: string;
    area: string;

    // UIの検索/表示用
    date: string;        // "YYYY-MM-DD"
    startTime?: string;  // "HH:MM"
    endTime?: string;

    // 地図で使う（無い場合は変換時にデフォ値を入れる）
    lat: number;
    lng: number;

    // 追加要素（DBから来る）
    prefecture?: string;
    status?: KakuregaEventStatus | string; // DBが自由文字列ならstring許容
    officialUrl?: string;
    contactEmail?: string;
    contactPhone?: string;

    priceYen: number;
    organizer?: string;
    tags?: string[];

    imagePaths?: string[];

    // 距離フィルタ時に付く
    distKm?: number;
};

export type UserLocation = {
    lat: number;
    lng: number;
};

export type FavoriteRow = {
    user_id: string;
    event_id: string;
    created_at: string;
};
