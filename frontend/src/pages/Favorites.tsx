import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { DbEvent } from '../types/types';
import { fetchMyFavoriteEvents } from '../lib/apiClient';

export default function Favorites() {
    const [events, setEvents] = useState<DbEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        const run = async () => {
            try {
                setLoading(true);
                setErrorMsg(null);

                const data = await fetchMyFavoriteEvents();
                setEvents(data);
            } catch (e: any) {
                setErrorMsg(e?.message ?? 'failed to fetch favorites');
            } finally {
                setLoading(false);
            }
        };
        run();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (errorMsg) return <div style={{ color: 'red' }}>{errorMsg}</div>;

    return (
        <div style={{ padding: 16 }}>
            <div style={{ marginBottom: 12 }}>
                <Link to="/">← 一覧へ</Link>
            </div>

            <h1>Favorites</h1>

            {events.length === 0 && <div>お気に入りはまだありません</div>}

            {events.map((ev) => (
                <div key={ev.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, marginBottom: 10 }}>
                    <div style={{ fontWeight: 700 }}>
                        <Link to={`/event?event_id=${ev.id}`}>
                            {ev.title ?? '(no title)'}
                        </Link>
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>
                        {ev.prefecture ?? ''} {ev.city ?? ''} / {ev.category ?? ''}
                    </div>
                </div>
            ))}
        </div>
    );
}
