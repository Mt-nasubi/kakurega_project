import React, { useEffect, useState } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { fetchPublicEvents, fetchMyFavoriteIds } from "../lib/apiClient";
import { dbToUiEvent } from "../lib/eventMapping";

import Layout from "./Layout";
import HomePage from "../pages/Home";
import SearchPage from "../pages/Search";
import SavedPage from "../pages/Favorites";
import AboutPage from "../pages/About";
import LoginPage from "../pages/Login";

const App: React.FC = () => {
    const [events, setEvents] = useState<any[]>([]);
    const [favIds, setFavIds] = useState<Set<string>>(new Set());
    const [eventsLoading, setEventsLoading] = useState(true);

    useEffect(() => {
        const run = async () => {
            setEventsLoading(true);

            try {
                const evs = await fetchPublicEvents();
                console.log("public events raw", evs);
                console.log("public events count", evs?.length ?? 0);

                const mapped = (evs ?? []).map(dbToUiEvent);
                console.log("public events mapped", mapped);
                console.log("public events mapped count", mapped.length);
                setEvents(mapped);
            } catch (e) {
                console.error("fetchPublicEvents failed", e);
                setEvents([]);
            }

            try {
                const fav = await fetchMyFavoriteIds();
                setFavIds(fav);
            } catch (e) {
                console.error("fetchMyFavoriteIds failed", e);
                setFavIds(new Set());
            }

            setEventsLoading(false);
        };

        run();
    }, []);

    return (
        <HashRouter>
            <Layout
                events={events}
                favIds={favIds}
                setFavIds={setFavIds}
                eventsLoading={eventsLoading}
            >
                <Routes>
                    <Route
                        path="/"
                        element={<HomePage events={events} eventsLoading={eventsLoading} />}
                    />
                    <Route
                        path="/search"
                        element={
                            <SearchPage
                                events={events}
                                eventsLoading={eventsLoading}
                                favIds={favIds}
                                setFavIds={setFavIds}
                            />
                        }
                    />
                    <Route
                        path="/saved"
                        element={<SavedPage favIds={favIds} setFavIds={setFavIds} />}
                    />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/login" element={<LoginPage />} />
                </Routes>
            </Layout>
        </HashRouter>
    );
};

export default App;
