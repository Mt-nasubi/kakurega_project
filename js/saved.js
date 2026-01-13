window.addEventListener("DOMContentLoaded", () => {
    const listEl = document.getElementById("savedList");

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

    function setSavedIds(ids) {
        localStorage.setItem("savedEventIds", JSON.stringify(ids));
    }

    function loadEventById(id) {
        const events = window.EVENTS || [];
        return events.find(e => e.id === id) || null;
    }

    function render() {
        const ids = getSavedIds();
        listEl.innerHTML = "";

        if (ids.length === 0) {
            const empty = document.createElement("div");
            empty.className = "card";
            empty.innerHTML = `
                <p class="card-title">まだ保存がありません</p>
                <p class="card-text">検索ページで「⭐ 保存」を押すと、ここに追加されます。</p>
                <a class="mini-link" href="search.html">検索ページへ →</a>
            `;
            listEl.appendChild(empty);
            return;
        }

        ids.forEach(rawId => {
            const id = Number(rawId);
            const e = loadEventById(id);
            if (!e) return;

            const priceText = (e.priceYen === 0) ? "無料" : `${e.priceYen}円`;

            const card = document.createElement("div");
            card.className = "card";
            card.innerHTML = `
                <p class="card-title">${e.title}</p>
                <p class="card-text">${e.date} / ${e.category} / ${priceText}</p>
                <p class="card-text">${e.city}（${e.area}）</p>
                <div class="event-actions">
                    <button class="btn-save" type="button" data-remove="${e.id}">🗑 削除</button>
                    <a class="btn-save" href="search.html">🔍 検索で見る</a>
                </div>
            `;
            listEl.appendChild(card);
        });

        document.querySelectorAll("[data-remove]").forEach(btn => {
            btn.addEventListener("click", (ev) => {
                const id = Number(ev.currentTarget.getAttribute("data-remove"));
                if (!id) return;

                const next = getSavedIds().filter(x => Number(x) !== id);
                setSavedIds(next);
                render();
            });
        });
    }

    render();
});
