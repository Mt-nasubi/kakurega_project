// src/pages/organizer/organizerhome.tsx

import React from "react";
import { Link } from "react-router-dom";

const OrganizerHomePage: React.FC = () => {
    return (
        <div
            style={{
                minHeight: "calc(100vh - 40px)",
                padding: 24,
                background:
                    "radial-gradient(1100px 540px at 18% 12%, rgba(34,197,94,0.18), transparent 55%), radial-gradient(900px 520px at 86% 22%, rgba(59,130,246,0.14), transparent 60%), linear-gradient(180deg, rgba(255,255,255,0.95), rgba(250,250,250,1))",
            }}
        >
            <div style={{ maxWidth: 980, margin: "0 auto" }}>
                {/* header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                    <div>
                        <div
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 8,
                                padding: "6px 10px",
                                borderRadius: 999,
                                border: "1px solid rgba(0,0,0,0.08)",
                                background: "rgba(34,197,94,0.08)",
                                fontSize: 12,
                                fontWeight: 800,
                            }}
                        >
                            ✨ 主催者向け
                        </div>

                        <h1 style={{ fontSize: 30, margin: "10px 0 6px 0" }}>
                            イベントを投稿して、見つけてもらおう。
                        </h1>
                        <p style={{ margin: 0, opacity: 0.85, lineHeight: 1.75 }}>
                            「隠れ家」では、地域の小さなイベントを
                            <br />
                            <b>主催者自身が直接投稿</b>できます。
                        </p>
                    </div>

                    <div style={{ fontSize: 12, opacity: 0.85 }}>
                        <Link to="/" style={{ textDecoration: "underline" }}>
                            一般ユーザーのトップへ
                        </Link>
                    </div>
                </div>

                {/* main */}
                <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 16 }}>
                    {/* left */}
                    <div
                        style={{
                            padding: 18,
                            borderRadius: 18,
                            border: "1px solid rgba(0,0,0,0.08)",
                            background: "rgba(255,255,255,0.85)",
                            boxShadow: "0 10px 26px rgba(0,0,0,0.06)",
                        }}
                    >
                        <h2 style={{ fontSize: 16, margin: 0 }}>主催者ができること</h2>

                        <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                            {[
                                { icon: "📝", title: "イベント投稿", desc: "専用フォームから簡単に追加" },
                                { icon: "🖼️", title: "写真掲載", desc: "雰囲気が伝わり集客力UP" },
                                { icon: "🔒", title: "自分のイベント管理", desc: "閲覧・編集・削除が可能" },
                            ].map((f) => (
                                <div
                                    key={f.title}
                                    style={{
                                        padding: 12,
                                        borderRadius: 14,
                                        border: "1px solid rgba(0,0,0,0.07)",
                                        background: "rgba(255,255,255,0.75)",
                                    }}
                                >
                                    <div style={{ fontSize: 20 }}>{f.icon}</div>
                                    <div style={{ marginTop: 6, fontWeight: 900, fontSize: 13 }}>{f.title}</div>
                                    <div style={{ marginTop: 4, fontSize: 12, opacity: 0.8 }}>{f.desc}</div>
                                </div>
                            ))}
                        </div>

                        <div
                            style={{
                                marginTop: 14,
                                padding: 12,
                                borderRadius: 14,
                                border: "1px solid rgba(34,197,94,0.22)",
                                background: "rgba(34,197,94,0.08)",
                                fontSize: 12,
                                lineHeight: 1.7,
                            }}
                        >
                            <b>登録時に必要な情報</b>
                            <br />
                            団体名 / 代表者名 / メール / 電話番号 / 住所
                            <br />
                            ＋ ログイン用メール・パスワード
                            <br />
                            ＋ 規約への同意（必須）
                        </div>
                    </div>

                    {/* right */}
                    <div
                        style={{
                            padding: 18,
                            borderRadius: 18,
                            border: "1px solid rgba(0,0,0,0.08)",
                            background: "rgba(255,255,255,0.85)",
                            boxShadow: "0 10px 26px rgba(0,0,0,0.06)",
                            display: "grid",
                            gap: 10,
                            alignContent: "start",
                        }}
                    >
                        <h2 style={{ fontSize: 16, margin: 0 }}>主催者メニュー</h2>

                        <Link
                            to="/organizer/login"
                            style={{
                                textDecoration: "none",
                                padding: "12px 14px",
                                borderRadius: 14,
                                background: "linear-gradient(90deg, #22c55e, #10b981)",
                                color: "white",
                                fontWeight: 900,
                                boxShadow: "0 10px 22px rgba(16,185,129,0.22)",
                            }}
                        >
                            ログインしてイベントを追加する →
                        </Link>

                        <Link
                            to="/organizer/signup"
                            style={{
                                textDecoration: "none",
                                padding: "12px 14px",
                                borderRadius: 14,
                                border: "1px solid rgba(0,0,0,0.12)",
                                background: "white",
                                fontWeight: 900,
                            }}
                        >
                            はじめての主催者登録 →
                        </Link>

                        <Link
                            to="/organizer/terms"
                            style={{
                                textDecoration: "none",
                                padding: "12px 14px",
                                borderRadius: 14,
                                border: "1px solid rgba(0,0,0,0.12)",
                                background: "white",
                                fontWeight: 900,
                            }}
                        >
                            主催者規約を見る →
                        </Link>

                        <div style={{ marginTop: 8, fontSize: 12, opacity: 0.85 }}>
                            <b>投稿の流れ</b>
                            <ol style={{ marginTop: 6, paddingLeft: 18 }}>
                                <li>主催者ログイン / 登録</li>
                                <li>ダッシュボードへ</li>
                                <li>イベントを追加</li>
                                <li>必要に応じて編集・削除</li>
                            </ol>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: 18, fontSize: 11, opacity: 0.7 }}>
                    ※ イベントの投稿には主催者ログインが必要です。
                </div>
            </div>
        </div>
    );
};

export default OrganizerHomePage;
