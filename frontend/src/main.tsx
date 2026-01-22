import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./app/App";
import { AuthProvider } from "./lib/auth";
import { ToastProvider } from "./context/toast";

ReactDOM.createRoot(document.getElementById("root")!).render(
        <ToastProvider>
            <HashRouter>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </HashRouter>
        </ToastProvider>
);
