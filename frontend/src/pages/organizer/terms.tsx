import React from "react";
import { Link } from "react-router-dom";

const TERMS_VERSION = "2026-01-26";

const TermsPage: React.FC = () => {
    return (
        <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
            <h1 style={{ fontSize: 26, marginBottom: 8 }}>主催者向け利用規約</h1>
            <div style={{ opacity: 0.7, marginBottom: 24 }}>
                規約バージョン: {TERMS_VERSION}
            </div>

            <div style={{ lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
{`第1条（適用）
本規約は、隠れ家（以下「当サービス」）における主催者向け機能（イベント掲載・編集・削除等）の利用条件を定めます。

第2条（主催者情報の登録）
主催者は、団体名、代表者名、連絡用メール、電話番号、住所等、当サービスが定める情報を正確に登録するものとします。
登録情報に虚偽・誤りがある場合、当サービスは掲載停止・削除等の措置を行うことがあります。

第3条（掲載責任）
主催者は、掲載するイベント情報（日時、場所、料金、問い合わせ先等）の正確性・適法性について一切の責任を負います。

第4条（禁止事項）
主催者は以下を行ってはなりません。
(1) 法令または公序良俗に反する内容の掲載
(2) 第三者の権利侵害（著作権、商標権、肖像権、プライバシー等）
(3) 虚偽情報・誇大広告・不当表示
(4) 反社会的勢力に関与する行為
(5) サービス運営を妨害する行為

第5条（掲載の停止・削除）
当サービスは、必要に応じて事前通知なく掲載内容の修正・停止・削除を行うことがあります。

第6条（免責）
当サービスは、主催者の掲載情報に起因して生じた損害について、当サービスの故意または重過失がない限り責任を負いません。

第7条（規約の変更）
当サービスは本規約を変更できるものとし、変更後の規約は当サービス上での掲示等により効力を生じます。

附則
本規約は ${TERMS_VERSION} より適用されます。`}
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
                <Link to="/organizer/signup" style={{ textDecoration: "underline" }}>
                    主催者登録へ進む
                </Link>
                <Link to="/organizer/login" style={{ textDecoration: "underline" }}>
                    主催者ログインへ
                </Link>
            </div>
        </div>
    );
};

export default TermsPage;
