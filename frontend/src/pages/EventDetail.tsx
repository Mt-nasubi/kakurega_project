import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { DbEvent } from '../types/types';
import { fetchEventById } from '../lib/apiClient';

export default function EventDetail() {
    const [params] = useSearchParams();
    const eventId = useMemo(() => params.get('event_id') ?? '', [params]);

    const [event, setEvent] = useState<DbEvent | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        const run = async () => {
            try {
                setLoading(true);
                setErrorMsg(null);

                if (!eventId) {
                    setEvent(null);
                    setErrorMsg('event_id がありません');
                    return;
                }

                const data = await fetchEventById(eventId);
                setEvent(data);
                if (!data) setErrorMsg('イベントが見つかりません');
            } catch (e: any) {
                setErrorMsg(e?.message ?? 'failed to fetch event');
            } finally {
                setLoading(false);
            }
        };
        run();
    }, [eventId]);

    if (loading) return <div>Loading...</div>;
    if (errorMsg) return <div style={{ color: 'red' }}>{errorMsg}</div>;
    if (!event) return <div>Not Found</div>;

    return (
        <div style={{ padding: 16 }}>
            <div style={{ marginBottom: 12 }}>
                <Link to="/">← 戻る</Link>
            </div>

            <h1>{event.title}</h1>
            <div style={{ opacity: 0.8 }}>
                {event.prefecture ?? ''} {event.city ?? ''} / {event.category ?? ''}
            </div>
            <div style={{ opacity: 0.8 }}>
                {event.start_at ?? ''}{event.end_at ? ` 〜 ${event.end_at}` : ''}
            </div>

            <hr style={{ margin: '16px 0' }} />

            <p>{event.description}</p>
        </div>
    );
}
