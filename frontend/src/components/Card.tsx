export type KakuregaEvent = {
    id: string;
    title: string;
    description: string;
    category: string;
    city: string;
    area: string;
    date: string;
    startTime: string;
    endTime: string;
    lat: number;
    lng: number;
    priceYen: number;
    organizer?: string;
    tags?: string[];
    image_paths?: string[];
    imageUrl?: string;
    distKm?: number;
};

export type UserLocation = {
    lat: number;
    lng: number;
};
