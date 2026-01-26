import React, { useState } from "react";
import { Link } from "react-router-dom";


const MegaMenu: React.FC = () => {
    return (
        <div
            className="
                absolute left-0 top-full w-full
                bg-white border-t border-black/10
                shadow-xl
            "
        >
            <div className="max-w-6xl mx-auto px-10 py-10 grid grid-cols-4 gap-10">

                {/* 探す */}
                <div>
                    <h3 className="font-bold text-sm mb-4">イベントを探す</h3>
                    <ul className="space-y-2 text-sm text-kakurega-muted">
                        <li><Link to="/search">地域から探す</Link></li>
                        <li><Link to="/search">日付から探す</Link></li>
                        <li><Link to="/search">ジャンルから探す</Link></li>
                        <li><Link to="/search">ランキング</Link></li>
                    </ul>
                </div>

                {/* 案内 */}
                <div>
                    <h3 className="font-bold text-sm mb-4">案内</h3>
                    <ul className="space-y-2 text-sm text-kakurega-muted">
                        <li><Link to="/about">このサイトについて</Link></li>
                        <li><Link to="/terms">利用規約</Link></li>
                        <li><Link to="/privacy">プライバシーポリシー</Link></li>
                    </ul>
                </div>

                {/* ユーザー */}
                <div>
                    <h3 className="font-bold text-sm mb-4">ユーザー</h3>
                    <ul className="space-y-2 text-sm text-kakurega-muted">
                        <li><Link to="/login">ログイン</Link></li>
                        <li><Link to="/login?mode=signup">新規会員登録</Link></li>
                        <li><Link to="/saved">保存したイベント</Link></li>
                    </ul>
                </div>

                {/* その他 */}
                <div>
                    <h3 className="font-bold text-sm mb-4">その他</h3>
                    <ul className="space-y-2 text-sm text-kakurega-muted">
                        <li><Link to="/about">運営情報</Link></li>
                        <li><Link to="/contact">お問い合わせ</Link></li>
                        <li><Link to="/organizer/organizerhome">イベント掲載方法</Link></li>
                    </ul>
                </div>

            </div>
        </div>
    );
};

export default MegaMenu;
