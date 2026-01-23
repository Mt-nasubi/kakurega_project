import React, { useEffect, useState } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { fetchPublicEvents, fetchMyFavoriteIds } from "../lib/apiClient";
import { dbToUiEvent } from "../lib/eventMapping";
import { RequireAuth } from "../routes/RequireAuth";

import Layout from "./Layout";
import HomePage from "../pages/Home";
import SearchPage from "../pages/Search";
import SavedPage from "../pages/Favorites";
import AboutPage from "../pages/About";
import LoginPage from "../pages/Login";
import SignupPage from "../pages/Signup";
import Favorites from "../pages/Favorites";
import MyPage from "../pages/MyPage";
import AuthCallbackPage from "../pages/AuthCallback";
import AuthSuccess from "../pages/AuthSuccess";
import AuthError from "../pages/AuthError";
import PrivacyPage from "../pages/Privacy";
import TermsPage from "../pages/Terms";
import ResetPasswordPage from "../pages/ResetPasswordPage";


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
                    <Route
                        path="/favorites"
                        element={
                            <RequireAuth>
                                <Favorites/>
                            </RequireAuth>
                        }
                    />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/mypage" element={<MyPage />} />
                    <Route path="/Privacy" element={<PrivacyPage />} />
                    <Route path="/Terms" element={<TermsPage />} />

                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/auth/callback" element={<AuthCallbackPage />} />
                    <Route path="/auth/success" element={<AuthSuccess />} />
                    <Route path="/auth/error" element={<AuthError />} />

                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                </Routes>
            </Layout>
    );
};

export default App;
