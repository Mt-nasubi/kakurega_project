export interface KakuregaEvent {
  id: number;
  title: string;
  category: string;
  date: string;
  priceYen: number;
  area: string;
  lat: number;
  lng: number;
  city: string;
  distKm?: number;
  // New fields for visual enhancement
  imageUrl?: string;
  description?: string;
  organizer?: string;
  tags?: string[];
  startTime?: string;
  endTime?: string;
}

export interface UserLocation {
  lat: number;
  lng: number;
}

// Augment window to include Leaflet
declare global {
  interface Window {
    L: any;
  }
}