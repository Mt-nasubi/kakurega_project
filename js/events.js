// events.js
// 30 sample events (Hyogo area)
// fields: id, title, category, date, priceYen, area, lat, lng, city

const EVENTS = [
    { id: 1, title: "生田神社 早春の縁日", category: "祭り", date: "2026-01-12", priceYen: 0, area: "神戸", lat: 34.6938, lng: 135.1951, city: "神戸" },
    { id: 2, title: "湊川手しごと市", category: "朝市", date: "2026-01-13", priceYen: 0, area: "神戸", lat: 34.6783, lng: 135.1711, city: "神戸" },
    { id: 3, title: "北野坂 小さな灯り散歩", category: "展示", date: "2026-01-14", priceYen: 0, area: "神戸", lat: 34.7006, lng: 135.1930, city: "神戸" },
    { id: 4, title: "灘の酒蔵 ちょい飲み散策", category: "体験", date: "2026-01-17", priceYen: 1200, area: "神戸", lat: 34.7150, lng: 135.2575, city: "神戸" },
    { id: 5, title: "長田 もちつき体験会", category: "体験", date: "2026-01-18", priceYen: 0, area: "神戸", lat: 34.6552, lng: 135.1457, city: "神戸" },
    { id: 6, title: "須磨海浜 公園ミニ凧あげ", category: "祭り", date: "2026-01-19", priceYen: 0, area: "神戸", lat: 34.6393, lng: 135.1193, city: "神戸" },
    { id: 7, title: "六甲山 霧氷さんぽ会", category: "体験", date: "2026-01-20", priceYen: 1500, area: "神戸", lat: 34.7744, lng: 135.2631, city: "神戸" },
    { id: 8, title: "三宮 高架下 古着と小物市", category: "展示", date: "2026-01-21", priceYen: 0, area: "神戸", lat: 34.6948, lng: 135.1959, city: "神戸" },
    { id: 9, title: "舞子公園 朝の音楽会", category: "展示", date: "2026-01-22", priceYen: 0, area: "神戸", lat: 34.6337, lng: 135.0357, city: "神戸" },
    { id: 10, title: "垂水 漁港の朝市", category: "朝市", date: "2026-01-24", priceYen: 0, area: "神戸", lat: 34.6267, lng: 135.0555, city: "神戸" },

    { id: 11, title: "明石 天文科学館前 小さな蚤の市", category: "朝市", date: "2026-01-12", priceYen: 0, area: "播磨", lat: 34.6467, lng: 134.9996, city: "明石" },
    { id: 12, title: "明石公園 こども昔あそび", category: "体験", date: "2026-01-13", priceYen: 0, area: "播磨", lat: 34.6484, lng: 134.9969, city: "明石" },
    { id: 13, title: "魚の棚商店街 食べ歩き小祭", category: "祭り", date: "2026-01-14", priceYen: 800, area: "播磨", lat: 34.6479, lng: 134.9917, city: "明石" },

    { id: 14, title: "西宮 神社前 えびす小縁日", category: "祭り", date: "2026-01-15", priceYen: 0, area: "阪神", lat: 34.7372, lng: 135.3310, city: "西宮" },
    { id: 15, title: "夙川 河川敷 早朝ヨガ会", category: "体験", date: "2026-01-16", priceYen: 0, area: "阪神", lat: 34.7482, lng: 135.3319, city: "西宮" },
    { id: 16, title: "甲子園浜 バードウォッチ会", category: "体験", date: "2026-01-18", priceYen: 0, area: "阪神", lat: 34.7122, lng: 135.3304, city: "西宮" },

    { id: 17, title: "芦屋 川沿い 手作り菓子市", category: "朝市", date: "2026-01-17", priceYen: 0, area: "阪神", lat: 34.7340, lng: 135.3077, city: "芦屋" },
    { id: 18, title: "芦屋 モダン建築ミニ展示", category: "展示", date: "2026-01-19", priceYen: 0, area: "阪神", lat: 34.7305, lng: 135.3037, city: "芦屋" },

    { id: 19, title: "尼崎 寺町 夕刻の提灯市", category: "祭り", date: "2026-01-20", priceYen: 0, area: "阪神", lat: 34.7185, lng: 135.4067, city: "尼崎" },
    { id: 20, title: "尼崎 ものづくり体験（町工場）", category: "体験", date: "2026-01-22", priceYen: 2500, area: "阪神", lat: 34.7310, lng: 135.4040, city: "尼崎" },

    { id: 21, title: "宝塚 花のみち ちいさな演奏会", category: "展示", date: "2026-01-12", priceYen: 0, area: "阪神", lat: 34.8096, lng: 135.3407, city: "宝塚" },
    { id: 22, title: "宝塚 朗読と本の時間", category: "展示", date: "2026-01-14", priceYen: 500, area: "阪神", lat: 34.8109, lng: 135.3408, city: "宝塚" },

    { id: 23, title: "三田 里山スープの会", category: "体験", date: "2026-01-15", priceYen: 1200, area: "丹波", lat: 34.8841, lng: 135.2257, city: "三田" },
    { id: 24, title: "三田 こもれび朝市", category: "朝市", date: "2026-01-18", priceYen: 0, area: "丹波", lat: 34.8847, lng: 135.2278, city: "三田" },

    { id: 25, title: "姫路 城下町 小さな骨董市", category: "朝市", date: "2026-01-13", priceYen: 0, area: "播磨", lat: 34.8395, lng: 134.6939, city: "姫路" },
    { id: 26, title: "姫路 大手前通り ミニパレード", category: "祭り", date: "2026-01-16", priceYen: 0, area: "播磨", lat: 34.8399, lng: 134.6930, city: "姫路" },

    { id: 27, title: "加古川 河川敷 たき火と珈琲会", category: "体験", date: "2026-01-17", priceYen: 1500, area: "播磨", lat: 34.7560, lng: 134.8414, city: "加古川" },
    { id: 28, title: "加古川 手作り雑貨ミニ展示", category: "展示", date: "2026-01-19", priceYen: 0, area: "播磨", lat: 34.7569, lng: 134.8419, city: "加古川" },

    { id: 29, title: "洲本 レトロ商店街 小縁日", category: "祭り", date: "2026-01-20", priceYen: 0, area: "淡路", lat: 34.3439, lng: 134.8996, city: "洲本" },
    { id: 30, title: "南あわじ 収穫体験会", category: "体験", date: "2026-01-21", priceYen: 3000, area: "淡路", lat: 34.2571, lng: 134.7150, city: "南あわじ" }
];
