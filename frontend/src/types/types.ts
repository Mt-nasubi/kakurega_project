// types.ts

// DB 列 (Supabase)
export type DbEvent = {
    id: string;
    created_at: string;
    updated_at: string;

    title: string;
    description: string | null;

    start_date: string;
    start_time: string | null;
    end_date: string | null;
    end_time: string | null;

    prefecture: string | null;
    city: string | null;
    category: string | null;
    location_name: string | null;

    latitude: number | null;
    longitude: number | null;

    status: string | null;
    organizer_id: string | null;
    organizer_name: string | null;

    official_url: string | null;
    contact_email: string | null;
    contact_phone: string | null;

    tags: string[] | null;
    image_paths: string[] | null;

    is_public: boolean;
    price_yen: number | null;
    fee_note: string | null;
    target_audience: string | null;
    indoor_outdoor: string | null;
    vibe: string | null;
    capacity: number | null;
    reservation_required: boolean | null;

    distKm?: number;
};

// UI 用のイベント型
export type KakuregaEvent = {
    id: string;
    title: string;
    description?: string;
    updated_at?: string;

    category: string;
    city: string;
    area: string;

    date: string;
    startTime?: string;
    endTime?: string;

    lat: number;
    lng: number;

    prefecture?: string;
    status?: string;
    officialUrl?: string;
    contactEmail?: string;
    contactPhone?: string;
    locationName?: string;

    priceYen: number;
    feeNote?: string;
    targetAudience?: string;
    indoorOutdoor?: string;
    vibe?: string;
    capacity?: number;
    reservationRequired?: boolean;

    organizer?: string;
    tags?: string[];

    imagePaths?: string[];
    imageUrl?: string;

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
