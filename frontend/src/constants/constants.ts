<<<<<<< Updated upstream
import { KakuregaEvent } from './types';
=======
import { KakuregaEvent } from '../types/types';
>>>>>>> Stashed changes

// Helper to get random images from Unsplash (using specific IDs for stability/aesthetics)
// Note: In a real app, these would be hosted images.
const IMAGES = {
    shrine: "https://images.unsplash.com/photo-1528360983277-13d9b152c611?q=80&w=800&auto=format&fit=crop", // Shrine/Festival
    market: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=800&auto=format&fit=crop", // Market/Food
    craft: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?q=80&w=800&auto=format&fit=crop", // Craft/Workshop
    nature: "https://images.unsplash.com/photo-1490750967868-58cb75063ed4?q=80&w=800&auto=format&fit=crop", // Nature/Walk
    cafe: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop", // Cafe/Coffee
    art: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format&fit=crop", // Art/Exhibition
    night: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=800&auto=format&fit=crop" // Night/Light
};

export const EVENTS: KakuregaEvent[] = [
    { 
        id: 1, title: "生田神社 早春の縁日", category: "祭り", date: "2026-01-12", priceYen: 0, area: "神戸", lat: 34.6938, lng: 135.1951, city: "神戸",
        imageUrl: IMAGES.shrine,
        description: "新春の透き通る空気の中、地元の人々で賑わう小さな縁日です。温かい甘酒の振る舞いもあります。",
        organizer: "生田地区振興会",
        tags: ["#伝統", "#家族向け", "#甘酒"],
        startTime: "10:00", endTime: "16:00"
    },
    { 
        id: 2, title: "湊川手しごと市", category: "朝市", date: "2026-01-13", priceYen: 0, area: "神戸", lat: 34.6783, lng: 135.1711, city: "神戸",
        imageUrl: IMAGES.market,
        description: "地元の作家さんが集まる手作り市。こだわりの革小物や焼き菓子が並びます。早起きして掘り出し物を探しませんか？",
        organizer: "湊川公園手しごと事務局",
        tags: ["#ハンドメイド", "#朝活", "#パン"],
        startTime: "09:00", endTime: "14:00"
    },
    { 
        id: 3, title: "北野坂 小さな灯り散歩", category: "展示", date: "2026-01-14", priceYen: 0, area: "神戸", lat: 34.7006, lng: 135.1930, city: "神戸",
        imageUrl: IMAGES.night,
        description: "異人館街の路地裏に、和紙で作られた行灯が並びます。静かな夜の散歩に最適です。",
        organizer: "北野まちなかアート",
        tags: ["#ライトアップ", "#デート", "#写真"],
        startTime: "17:00", endTime: "20:00"
    },
    { 
        id: 4, title: "灘の酒蔵 ちょい飲み散策", category: "体験", date: "2026-01-17", priceYen: 1200, area: "神戸", lat: 34.7150, lng: 135.2575, city: "神戸",
        imageUrl: IMAGES.market,
        description: "3つの酒蔵を巡り、搾りたての新酒を試飲できるツアー。おつまみ付き。",
        organizer: "灘五郷ウォーク",
        tags: ["#日本酒", "#大人の休日", "#要予約"],
        startTime: "13:00", endTime: "16:00"
    },
    { 
        id: 5, title: "長田 もちつき体験会", category: "体験", date: "2026-01-18", priceYen: 0, area: "神戸", lat: 34.6552, lng: 135.1457, city: "神戸",
        imageUrl: IMAGES.craft,
        description: "昔ながらの杵と臼を使った餅つき体験。つきたてのお餅をきな粉や醤油で頂けます。",
        organizer: "長田商店街",
        tags: ["#子供向け", "#食育", "#無料"],
        startTime: "10:00", endTime: "12:00"
    },
    { 
        id: 6, title: "須磨海浜 公園ミニ凧あげ", category: "祭り", date: "2026-01-19", priceYen: 0, area: "神戸", lat: 34.6393, lng: 135.1193, city: "神戸",
        imageUrl: IMAGES.nature,
        description: "冬の浜風を利用して凧あげを楽しみます。手ぶらで参加OK、貸出あり。",
        organizer: "須磨浦の風クラブ",
        tags: ["#海", "#公園", "#親子"],
        startTime: "11:00", endTime: "15:00"
    },
    { 
        id: 7, title: "六甲山 霧氷さんぽ会", category: "体験", date: "2026-01-20", priceYen: 1500, area: "神戸", lat: 34.7744, lng: 135.2631, city: "神戸",
        imageUrl: IMAGES.nature,
        description: "冬の六甲山で見られる自然の芸術「霧氷」をガイドと共に探します。温かいコーヒー付き。",
        organizer: "六甲ネイチャーガイド",
        tags: ["#登山", "#絶景", "#初心者歓迎"],
        startTime: "08:30", endTime: "12:00"
    },
    { 
        id: 8, title: "三宮 高架下 古着と小物市", category: "展示", date: "2026-01-21", priceYen: 0, area: "神戸", lat: 34.6948, lng: 135.1959, city: "神戸",
        imageUrl: IMAGES.art,
        description: "個性的な古着店が合同で行うガレージセール。レトロな小物も見つかります。",
        organizer: "トアウエスト商店会",
        tags: ["#ファッション", "#古着", "#掘り出し物"],
        startTime: "12:00", endTime: "19:00"
    },
    { 
        id: 9, title: "舞子公園 朝の音楽会", category: "展示", date: "2026-01-22", priceYen: 0, area: "神戸", lat: 34.6337, lng: 135.0357, city: "神戸",
        imageUrl: IMAGES.nature,
        description: "明石海峡大橋を背景に、地元のアコースティックバンドが演奏します。",
        organizer: "舞子ミュージックサークル",
        tags: ["#音楽", "#海", "#リラックス"],
        startTime: "10:00", endTime: "11:30"
    },
    { 
        id: 10, title: "垂水 漁港の朝市", category: "朝市", date: "2026-01-24", priceYen: 0, area: "神戸", lat: 34.6267, lng: 135.0555, city: "神戸",
        imageUrl: IMAGES.market,
        description: "水揚げされたばかりの新鮮な魚介類が並びます。活気あふれる漁港の雰囲気を楽しんで。",
        organizer: "垂水漁業協同組合",
        tags: ["#海鮮", "#新鮮", "#早起き"],
        startTime: "08:00", endTime: "11:00"
    },

    // --- Others (Using generic images for brevity in this example) ---
    { id: 11, title: "明石 天文科学館前 小さな蚤の市", category: "朝市", date: "2026-01-12", priceYen: 0, area: "播磨", lat: 34.6467, lng: 134.9996, city: "明石", imageUrl: IMAGES.market, description: "アンティーク雑貨や古本が並ぶ、落ち着いた雰囲気の蚤の市です。", organizer: "明石蚤の市実行委員会", tags: ["#アンティーク", "#雑貨"], startTime: "10:00", endTime: "15:00" },
    { id: 12, title: "明石公園 こども昔あそび", category: "体験", date: "2026-01-13", priceYen: 0, area: "播磨", lat: 34.6484, lng: 134.9969, city: "明石", imageUrl: IMAGES.nature, description: "コマ回しや竹馬など、昔ながらの遊びを公園で体験できます。", organizer: "明石パーク協会", tags: ["#子供", "#公園"], startTime: "10:00", endTime: "15:00" },
    { id: 13, title: "魚の棚商店街 食べ歩き小祭", category: "祭り", date: "2026-01-14", priceYen: 800, area: "播磨", lat: 34.6479, lng: 134.9917, city: "明石", imageUrl: IMAGES.market, description: "明石焼きやタコの天ぷらなど、名物を食べ歩きできるチケット制イベント。", organizer: "魚の棚商店街振興組合", tags: ["#グルメ", "#食べ歩き"], startTime: "11:00", endTime: "17:00" },

    { id: 14, title: "西宮 神社前 えびす小縁日", category: "祭り", date: "2026-01-15", priceYen: 0, area: "阪神", lat: 34.7372, lng: 135.3310, city: "西宮", imageUrl: IMAGES.shrine, description: "十日戎の余韻を楽しむ、地元向けの小さな縁日。", organizer: "西宮戎講", tags: ["#縁日", "#伝統"], startTime: "10:00", endTime: "18:00" },
    { id: 15, title: "夙川 河川敷 早朝ヨガ会", category: "体験", date: "2026-01-16", priceYen: 0, area: "阪神", lat: 34.7482, lng: 135.3319, city: "西宮", imageUrl: IMAGES.nature, description: "清流・夙川のほとりで、朝日を浴びながらヨガを行います。", organizer: "夙川ヨガサークル", tags: ["#健康", "#朝活"], startTime: "07:00", endTime: "08:00" },
    { id: 16, title: "甲子園浜 バードウォッチ会", category: "体験", date: "2026-01-18", priceYen: 0, area: "阪神", lat: 34.7122, lng: 135.3304, city: "西宮", imageUrl: IMAGES.nature, description: "冬の渡り鳥を観察します。双眼鏡の貸出あり。", organizer: "西宮自然保護の会", tags: ["#自然", "#野鳥"], startTime: "09:00", endTime: "11:00" },

    { id: 17, title: "芦屋 川沿い 手作り菓子市", category: "朝市", date: "2026-01-17", priceYen: 0, area: "阪神", lat: 34.7340, lng: 135.3077, city: "芦屋", imageUrl: IMAGES.market, description: "地元のパティシエや料理研究家が出店する、一日限定のお菓子市。", organizer: "芦屋スイーツプロジェクト", tags: ["#スイーツ", "#マルシェ"], startTime: "10:00", endTime: "15:00" },
    { id: 18, title: "芦屋 モダン建築ミニ展示", category: "展示", date: "2026-01-19", priceYen: 0, area: "阪神", lat: 34.7305, lng: 135.3037, city: "芦屋", imageUrl: IMAGES.art, description: "芦屋に残るモダン建築の写真と模型の展示会。", organizer: "芦屋建築保存会", tags: ["#建築", "#歴史"], startTime: "10:00", endTime: "17:00" },

    { id: 19, title: "尼崎 寺町 夕刻の提灯市", category: "祭り", date: "2026-01-20", priceYen: 0, area: "阪神", lat: 34.7185, lng: 135.4067, city: "尼崎", imageUrl: IMAGES.night, description: "寺町の古い町並みを提灯で照らします。屋台も数店出ます。", organizer: "寺町活性化委員会", tags: ["#夜景", "#風情"], startTime: "17:00", endTime: "20:00" },
    { id: 20, title: "尼崎 ものづくり体験（町工場）", category: "体験", date: "2026-01-22", priceYen: 2500, area: "阪神", lat: 34.7310, lng: 135.4040, city: "尼崎", imageUrl: IMAGES.craft, description: "金属加工の町工場で、オリジナルのキーホルダーを作ります。", organizer: "メイドインアマガサキ", tags: ["#工場", "#DIY"], startTime: "13:00", endTime: "16:00" },

    { id: 21, title: "宝塚 花のみち ちいさな演奏会", category: "展示", date: "2026-01-12", priceYen: 0, area: "阪神", lat: 34.8096, lng: 135.3407, city: "宝塚", imageUrl: IMAGES.art, description: "花のみちのベンチ周辺で行われる、ストリートピアノ演奏会。", organizer: "宝塚音楽振興会", tags: ["#音楽", "#無料"], startTime: "13:00", endTime: "15:00" },
    { id: 22, title: "宝塚 朗読と本の時間", category: "展示", date: "2026-01-14", priceYen: 500, area: "阪神", lat: 34.8109, lng: 135.3408, city: "宝塚", imageUrl: IMAGES.cafe, description: "古書店の一角で、紅茶を飲みながら朗読に耳を傾けます。", organizer: "古書 月の裏", tags: ["#読書", "#カフェ"], startTime: "15:00", endTime: "16:30" },

    { id: 23, title: "三田 里山スープの会", category: "体験", date: "2026-01-15", priceYen: 1200, area: "丹波", lat: 34.8841, lng: 135.2257, city: "三田", imageUrl: IMAGES.market, description: "地元野菜をたっぷり使ったスープを、里山の風景の中で味わいます。", organizer: "三田里山農園", tags: ["#野菜", "#ランチ"], startTime: "11:00", endTime: "14:00" },
    { id: 24, title: "三田 こもれび朝市", category: "朝市", date: "2026-01-18", priceYen: 0, area: "丹波", lat: 34.8847, lng: 135.2278, city: "三田", imageUrl: IMAGES.nature, description: "森の中の広場で開催される朝市。オーガニック野菜が中心です。", organizer: "森のマルシェ実行委", tags: ["#オーガニック", "#朝市"], startTime: "08:00", endTime: "12:00" },

    { id: 25, title: "姫路 城下町 小さな骨董市", category: "朝市", date: "2026-01-13", priceYen: 0, area: "播磨", lat: 34.8395, lng: 134.6939, city: "姫路", imageUrl: IMAGES.art, description: "姫路城の見える公園で、古道具や骨董品が並びます。", organizer: "播磨骨董倶楽部", tags: ["#骨董", "#レトロ"], startTime: "09:00", endTime: "16:00" },
    { id: 26, title: "姫路 大手前通り ミニパレード", category: "祭り", date: "2026-01-16", priceYen: 0, area: "播磨", lat: 34.8399, lng: 134.6930, city: "姫路", imageUrl: IMAGES.shrine, description: "地元の和太鼓チームによる練り歩きパフォーマンス。", organizer: "姫路太鼓連盟", tags: ["#和太鼓", "#祭り"], startTime: "14:00", endTime: "15:00" },

    { id: 27, title: "加古川 河川敷 たき火と珈琲会", category: "体験", date: "2026-01-17", priceYen: 1500, area: "播磨", lat: 34.7560, lng: 134.8414, city: "加古川", imageUrl: IMAGES.nature, description: "河川敷で焚き火を囲みながら、自分で豆を挽いてコーヒーを淹れます。", organizer: "加古川アウトドアクラブ", tags: ["#焚き火", "#コーヒー", "#癒し"], startTime: "16:00", endTime: "19:00" },
    { id: 28, title: "加古川 手作り雑貨ミニ展示", category: "展示", date: "2026-01-19", priceYen: 0, area: "播磨", lat: 34.7569, lng: 134.8419, city: "加古川", imageUrl: IMAGES.craft, description: "地元の主婦作家さんたちによる、日常雑貨の展示販売会。", organizer: "クラフトサークルK", tags: ["#雑貨", "#ハンドメイド"], startTime: "10:00", endTime: "16:00" },

    { id: 29, title: "洲本 レトロ商店街 小縁日", category: "祭り", date: "2026-01-20", priceYen: 0, area: "淡路", lat: 34.3439, lng: 134.8996, city: "洲本", imageUrl: IMAGES.night, description: "昭和レトロな商店街で、射的や輪投げが楽しめる小さな縁日。", organizer: "洲本商店街", tags: ["#レトロ", "#縁日"], startTime: "16:00", endTime: "20:00" },
    { id: 30, title: "南あわじ 収穫体験会", category: "体験", date: "2026-01-21", priceYen: 3000, area: "淡路", lat: 34.2571, lng: 134.7150, city: "南あわじ", imageUrl: IMAGES.nature, description: "旬の玉ねぎやレタスの収穫体験。採れたて野菜のBBQ付き。", organizer: "淡路島ファーム", tags: ["#収穫", "#BBQ", "#食育"], startTime: "10:00", endTime: "14:00" }
];