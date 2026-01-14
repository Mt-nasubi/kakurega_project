export type DbEvent = {
    id: string; // SupabaseのuuidはJS側では文字列で扱う
    created_at: string;
    updated_at: string;
    title: string;
    description: string | null;
    start_at: string;
    end_at: string | null;
    prefecture: string | null;
    city: string | null;
    category: string | null;
    is_public: boolean;
};

export type KakuregaEvent = {
    id: string;

    title: string;
    description?: string;

    // UIで使ってる
    category: string;
    city: string;
    area: string;

    // UIの検索/表示用に分けてる
    date: string;        // "YYYY-MM-DD"
    startTime?: string;  // "HH:MM"
    endTime?: string;

    // 地図で使う（とりあえず必須にして、無い場合は変換時にデフォ値を入れる）
    lat: number;
    lng: number;

    priceYen: number;
    organizer?: string;
    tags?: string[];
    imageUrl?: string;

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
