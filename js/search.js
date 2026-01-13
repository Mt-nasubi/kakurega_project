window.addEventListener("DOMContentLoaded", () => {
    const events = window.EVENTS || [];

    const eventTypeEl = document.getElementById("eventType");
    const budgetEl = document.getElementById("budget");
    const periodEl = document.getElementById("period");
    const dateRangeEl = document.getElementById("dateRange");
    const dateFromEl = document.getElementById("dateFrom");
    const dateToEl = document.getElementById("dateTo");
    const distanceEl = document.getElementById("distance");
    const areaEl = document.getElementById("area");
    const cityEl = document.getElementById("city");
    const searchBtn = document.getElementById("searchBtn");

    const locStatusEl = document.getElementById("locStatus");
    const cardsEl = document.getElementById("cards");
    const resultCountEl = document.getElementById("resultCount");

    const map = L.map("map").setView([34.6901, 135.1955], 11);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

    let markers = [];
    let userLocation = null;
    let userMarker = null;

    function clearMarkers() {
        markers.forEach(m => map.removeLayer(m));
        markers = [];
    }

    function haversineKm(lat1, lng1, lat2, lng2) {
        const R = 6371;
        const toRad = d => d * Math.PI / 180;

        const dLat = toRad(lat2 - lat1);
        const dLng = toRad(lng2 - lng1);

        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng / 2) ** 2;

        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    function toYmd(d) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
    }

    function getPeriodRange(p) {
        const now = new Date();
        let from = null;
        let to = null;

        if (p === "today") {
            from = toYmd(now);
            to = toYmd(now);
        } else if (p === "week") {
            const start = new Date(now);
            const day = now.getDay();
            const diffToMon = (day === 0) ? -6 : (1 - day);
            start.setDate(now.getDate() + diffToMon);

            const end = new Date(start);
            end.setDate(start.getDate() + 6);

            from = toYmd(start);
            to = toYmd(end);
        } else if (p === "month") {
            from = toYmd(new Date(now.getFullYear(), now.getMonth(), 1));
            to = toYmd(new Date(now.getFullYear(), now.getMonth() + 1, 0));
        } else if (p === "year") {
            from = `${now.getFullYear()}-01-01`;
            to = `${now.getFullYear()}-12-31`;
        }

        return { from, to };
    }

    function getSavedIds() {
        try {
            const raw = localStorage.getItem("savedEventIds");
            const ids = raw ? JSON.parse(raw) : [];
            if (Array.isArray(ids)) return ids;
            return [];
        } catch {
            return [];
        }
    }

    function saveId(id) {
        const ids = getSavedIds();
        if (ids.includes(id)) return;
        ids.push(id);
        localStorage.setItem("savedEventIds", JSON.stringify(ids));
    }

    function render(list) {
        clearMarkers();

        if (userLocation) {
            if (userMarker) map.removeLayer(userMarker);

            userMarker = L.circleMarker([userLocation.lat, userLocation.lng], {
                radius: 6,
                weight: 2,
                fillOpacity: 0.5
            }).addTo(map);

            markers.push(userMarker);
        }

        cardsEl.innerHTML = "";

        list.forEach(e => {
            const priceText = (e.priceYen === 0) ? "無料" : `${e.priceYen}円`;
            const distText = (e.distKm !== undefined) ? ` / ${e.distKm.toFixed(1)}km` : "";

            const marker = L.marker([e.lat, e.lng]).addTo(map);
            marker.bindPopup(`
                <div style="font-size:12px;line-height:1.6;">
                    <b>${e.title}</b><br>
                    ${e.date} / ${e.category} / ${priceText}<br>
                    ${e.city}（${e.area}）${distText}<br>
                    <button data-save="${e.id}" style="margin-top:6px;padding:7px 9px;border-radius:12px;border:1px solid rgba(0,0,0,0.14);background:#fff;cursor:pointer;">
                        ⭐ 保存
                    </button>
                </div>
            `);

            markers.push(marker);

            const card = document.createElement("div");
            card.className = "card";
            card.innerHTML = `
                <p class="card-title">${e.title}</p>
                <p class="card-text">${e.date} / ${e.category} / ${priceText}${distText}</p>
                <p class="card-text">${e.city}（${e.area}）</p>
                <div class="event-actions">
                    <button class="btn-save" type="button" data-save="${e.id}">⭐ 保存</button>
                    <button class="btn-save" type="button" data-zoom="${e.id}">📍 地図</button>
                </div>
            `;

            card.querySelector('[data-zoom]').addEventListener("click", () => {
                map.setView([e.lat, e.lng], 14);
            });

            card.querySelector('[data-save]').addEventListener("click", () => {
                saveId(e.id);
                alert("保存しました");
            });

            cardsEl.appendChild(card);
        });

        resultCountEl.textContent = `${list.length}件`;

        setTimeout(() => {
            document.querySelectorAll('[data-save]').forEach(btn => {
                btn.addEventListener("click", (ev) => {
                    const id = Number(ev.currentTarget.getAttribute("data-save"));
                    if (!id) return;
                    saveId(id);
                    alert("保存しました");
                });
            });
        }, 0);
    }

    function applyFilters() {
        let filtered = events.slice();

        if (eventTypeEl.value) {
            filtered = filtered.filter(e => e.category === eventTypeEl.value);
        }

        if (budgetEl.value !== "") {
            const max = Number(budgetEl.value);
            filtered = filtered.filter(e => e.priceYen <= max);
        }

        if (periodEl.value) {
            let from = null;
            let to = null;

            if (periodEl.value === "range") {
                from = dateFromEl.value || null;
                to = dateToEl.value || null;
            } else {
                const r = getPeriodRange(periodEl.value);
                from = r.from;
                to = r.to;
            }

            filtered = filtered.filter(e => {
                if (!e.date) return false;
                if (from && e.date < from) return false;
                if (to && e.date > to) return false;
                return true;
            });
        }

        if (areaEl.value) {
            filtered = filtered.filter(e => e.area === areaEl.value);
        }

        const cityQ = (cityEl.value || "").trim();
        if (cityQ) {
            filtered = filtered.filter(e => (e.city || "").includes(cityQ));
        }

        const distMax = distanceEl.value ? Number(distanceEl.value) : null;
        if (distMax && userLocation) {
            filtered = filtered
                .map(e => ({
                    ...e,
                    distKm: haversineKm(userLocation.lat, userLocation.lng, e.lat, e.lng)
                }))
                .filter(e => e.distKm <= distMax)
                .sort((a, b) => a.distKm - b.distKm);
        }

        render(filtered);
    }

    periodEl.addEventListener("change", () => {
        if (periodEl.value === "range") {
            dateRangeEl.style.display = "flex";
        } else {
            dateRangeEl.style.display = "none";
            dateFromEl.value = "";
            dateToEl.value = "";
        }
    });

    distanceEl.addEventListener("change", () => {
        if (!distanceEl.value) {
            userLocation = null;
            locStatusEl.textContent = "";
            return;
        }

        locStatusEl.textContent = "距離を使うため、現在地を取得しています…";

        if (!navigator.geolocation) {
            locStatusEl.textContent = "このブラウザは位置情報に対応していません。";
            distanceEl.value = "";
            userLocation = null;
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                userLocation = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                };
                locStatusEl.textContent = "現在地を取得しました。検索を押すと距離で絞り込めます。";
                map.setView([userLocation.lat, userLocation.lng], 12);
            },
            () => {
                locStatusEl.textContent = "位置情報を取得できませんでした。距離指定を解除してください。";
                distanceEl.value = "";
                userLocation = null;
            },
            { enableHighAccuracy: true, timeout: 8000 }
        );
    });

    searchBtn.addEventListener("click", applyFilters);

    dateRangeEl.style.display = "none";
    applyFilters();
});
