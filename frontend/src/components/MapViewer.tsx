import React, { useEffect, useRef, useState } from "react";
import type { KakuregaEvent, UserLocation } from "../types/types";
import { coverImageUrl } from "../lib/storage";

const MapViewer: React.FC<{
    events: KakuregaEvent[];
    userLocation: UserLocation | null;
    onSave: (id: string) => void;
}> = ({ events, userLocation, onSave }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const [isMapReady, setIsMapReady] = useState(false);

    useEffect(() => {
        if ((window as any).L) {
            setIsMapReady(true);
            return;
        }

        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = () => setIsMapReady(true);
        document.head.appendChild(script);

        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
    }, []);

    useEffect(() => {
        if (!isMapReady || !mapRef.current) return;
        if (!mapInstance.current) {
            const L = (window as any).L;
            mapInstance.current = L.map(mapRef.current, { zoomControl: false }).setView(
                [34.6937, 135.1955],
                11
            );
            L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
                attribution: "&copy; OpenStreetMap &copy; CARTO",
                subdomains: "abcd",
                maxZoom: 19,
            }).addTo(mapInstance.current);
            L.control.zoom({ position: "bottomright" }).addTo(mapInstance.current);
        }
    }, [isMapReady]);

    useEffect(() => {
        if (!isMapReady || !mapInstance.current) return;
        const L = (window as any).L;
        const map = mapInstance.current;

        markersRef.current.forEach((m) => map.removeLayer(m));
        markersRef.current = [];

        if (userLocation) {
            const userIcon = L.divIcon({
                className: "user-marker",
                html: `<div style="background-color:#3b82f6;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 0 5px rgba(0,0,0,0.3);"></div>`,
                iconSize: [14, 14],
            });
            markersRef.current.push(
                L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(map)
            );
        }

        events.forEach((e) => {
            const icon = L.divIcon({
                className: "event-marker",
                html: `<div style="background-color:#0e6b2a;color:white;width:30px;height:30px;display:flex;align-items:center;justify-content:center;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white;box-shadow:0 3px 5px rgba(0,0,0,0.2);"><span style="transform:rotate(45deg);font-size:12px;font-weight:bold;">${String(e.id).slice(0, 3)}</span></div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 30],
                popupAnchor: [0, -30],
            });

            const m = L.marker([e.lat, e.lng], { icon }).addTo(map);

            const content = document.createElement("div");
            content.innerHTML = `
                <div style="width:200px;">
                    <div style="height:100px;background:url('${coverImageUrl(e)}') center/cover;border-radius:8px 8px 0 0;"></div>
                    <div style="padding:8px;">
                        <div style="font-size:10px;color:#0e6b2a;font-weight:bold;">${e.category}</div>
                        <div style="font-weight:bold;font-size:13px;margin:2px 0;">${e.title}</div>
                        <div style="font-size:10px;color:#666;margin-bottom:6px;">${e.date}</div>
                        <button id="btn-detail-${CSS.escape(String(e.id))}" style="width:100%;background:#0e6b2a;color:white;border:none;padding:4px;border-radius:4px;cursor:pointer;">詳細</button>
                    </div>
                </div>
            `;
            m.bindPopup(content);

            m.on("popupopen", () => {
                const b = document.getElementById(`btn-detail-${String(e.id)}`);
                if (b)
                    (b as HTMLButtonElement).onclick = () => {
                        window.location.hash = `#/search?event_id=${encodeURIComponent(String(e.id))}`;
                    };
            });

            markersRef.current.push(m);
        });

        if (markersRef.current.length > 0) {
            map.fitBounds((window as any).L.featureGroup(markersRef.current).getBounds(), {
                padding: [50, 50],
            });
        }
    }, [isMapReady, events, userLocation, onSave]);

    return <div ref={mapRef} className="w-full h-full" />;
};

export default MapViewer;
