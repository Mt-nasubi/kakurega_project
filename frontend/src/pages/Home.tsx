import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { DbEvent } from '../types/types';
import { fetchPublicEvents, fetchMyFavoriteIds, addFavorite, removeFavorite } from '../lib/apiClient';

export default function Home() {
    const [events, setEvents] = useState<DbEvent[]>([]);
    const [favIds, setFavIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        const run = async () => {
            try {
                setLoading(true);
                setErrorMsg(null);

                const [evs, fav] = await Promise.all([
                    fetchPublicEvents(),
                    fetchMyFavoriteIds(),
                ]);
                
                console.log("App DEBUG evs", evs);
                console.log("App DEBUG evs length", evs?.length);

                setEvents(evs);
                setFavIds(fav);
            } catch (e: any) {
                setErrorMsg(e?.message ?? 'failed to fetch events');
            } finally {
                setLoading(false);
            }
        };
        run();
    }, []);

    const toggleFav = async (eventId: string) => {
        const isFav = favIds.has(eventId);

        setFavIds((prev) => {
            const next = new Set(prev);
            if (isFav) next.delete(eventId);
            else next.add(eventId);
            return next;
        });

        try {
            if (isFav) await removeFavorite(eventId);
            else await addFavorite(eventId);
        } catch {
            // 失敗したら戻す
            setFavIds((prev) => {
                const next = new Set(prev);
                if (isFav) next.add(eventId);
                else next.delete(eventId);
                return next;
            });
        }
    };

    if (loading) return <div>Loading...</div>;
    if (errorMsg) return <div style={{ color: 'red' }}>{errorMsg}</div>;

    return (
        <div style={{ padding: 16 }}>
            <h1>Events</h1>

            <div style={{ marginBottom: 12 }}>
                <Link to="/favorites">お気に入りへ</Link>
            </div>

            {events.map((ev) => {
                const isFav = favIds.has(ev.id);

                return (
                    <div key={ev.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                            <div>
                                <div style={{ fontWeight: 700 }}>
                                    <Link to={`/event?event_id=${ev.id}`}>
                                        {ev.title ?? '(no title)'}
                                    </Link>
                                </div>
                                <div style={{ fontSize: 12, opacity: 0.8 }}>
                                    {ev.prefecture ?? ''} {ev.city ?? ''} / {ev.category ?? ''}
                                </div>
                                <div style={{ fontSize: 12, opacity: 0.8 }}>
                                    {ev.start_at ?? ''}{ev.end_at ? ` 〜 ${ev.end_at}` : ''}
                                </div>
                            </div>

                            <button onClick={() => toggleFav(ev.id)} style={{ fontSize: 18 }}>
                                {isFav ? '★' : '☆'}
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
