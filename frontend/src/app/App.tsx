import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { fetchPublicEvents, fetchMyFavoriteIds } from "../lib/apiClient";
import { dbToUiEvent } from "../lib/eventMapping";
import { RequireAuth } from "../routes/RequireAuth";
import { useAuth } from "../lib/auth";
import type { KakuregaEvent } from "../types/types";

import Layout from "./Layout";
import HomePage from "../pages/home";
import SearchPage from "../pages/search";
import SavedPage from "../pages/saved";
import AboutPage from "../pages/about";
import LoginPage from "../pages/login";
import RequireLoginPage from "../pages/requireLogin";
import SignupPage from "../pages/signup";
import MyPage from "../pages/mypage";
import AuthCallbackPage from "../pages/authcallback";
import AuthSuccess from "../pages/authsuccess";
import AuthError from "../pages/autherror";
import PrivacyPage from "../pages/privacy";
import TermsPage from "../pages/terms";
import ResetPasswordPage from "../pages/resetpassword";
import GuidePage from "../pages/guide";
import ContactPage from "../pages/contact";
import FaqPage from "../pages/faq";
import OperatorPage from "../pages/operator";

import OrganizerHomePage from "../pages/organizer/organizerhome";
import OrganizerLoginPage from "../pages/organizer/login";
import OrganizerSignupPage from "../pages/organizer/signup";
import OrganizerTermsPage from "../pages/organizer/terms";
import OrganizerDashboardPage from "../pages/organizer/dashboard";
import OrganizerNewEventPage from "../pages/organizer/events/new";
import OrganizerEditEventPage from "../pages/organizer/events/edit";

const App: React.FC = () => {
    const { user } = useAuth();

    const [events, setEvents] = useState<KakuregaEvent[]>([]);
    const [favIds, setFavIds] = useState<Set<string>>(new Set());
    const [eventsLoading, setEventsLoading] = useState(true);

    useEffect(() => {
        const run = async () => {
            setEventsLoading(true);

            try {
                const evs = await fetchPublicEvents();
                const mapped = (evs ?? []).map(dbToUiEvent);
                setEvents(mapped);
            } catch (e) {
                console.error("fetchPublicEvents failed", e);
                setEvents([]);
            }

            setEventsLoading(false);
        };

        void run();
    }, []);

    useEffect(() => {
        const run = async () => {
            try {
                const fav = await fetchMyFavoriteIds();
                setFavIds(fav);
            } catch (e) {
                console.error("fetchMyFavoriteIds failed", e);
                setFavIds(new Set());
            }
        };

        void run();
    }, [user]);

    return (
        <Layout
            events={events}
            favIds={favIds}
            setFavIds={setFavIds}
            eventsLoading={eventsLoading}
        >
            <Routes>
                <Route path="/" element={<HomePage events={events} eventsLoading={eventsLoading} />} />
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
                    element={
                        <RequireAuth>
                            <SavedPage favIds={favIds} setFavIds={setFavIds} />
                        </RequireAuth>
                    }
                />

                <Route path="/about" element={<AboutPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/require-login" element={<RequireLoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/mypage" element={<MyPage />} />

                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/guide" element={<GuidePage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/faq" element={<FaqPage />} />
                <Route path="/operator" element={<OperatorPage />} />

                <Route path="/auth/callback" element={<AuthCallbackPage />} />
                <Route path="/auth/success" element={<AuthSuccess />} />
                <Route path="/auth/error" element={<AuthError />} />

                <Route path="/organizer/organizerhome" element={<OrganizerHomePage />} />
                <Route path="/organizer/login" element={<OrganizerLoginPage />} />
                <Route path="/organizer/signup" element={<OrganizerSignupPage />} />
                <Route path="/organizer/terms" element={<OrganizerTermsPage />} />
                <Route path="/organizer/dashboard" element={<OrganizerDashboardPage />} />
                <Route path="/organizer/events/new" element={<OrganizerNewEventPage />} />
                <Route path="/organizer/events/edit/:id" element={<OrganizerEditEventPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Routes>
        </Layout>
    );
};

export default App;