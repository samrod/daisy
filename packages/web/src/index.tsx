import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import * as serviceWorker from "@/serviceWorker";
import * as Sentry from "@sentry/react";
import { AuthProvider } from "@/context/AuthContext";

import PrivateRoute from "@/Pages/auth/PrivateRoute";
import Signup from "@/Pages/auth/Signup";
import Login from "@/Pages/auth/Login";
import ForgotPassword from "@/Pages/auth/ForgotPassword";
import ResetPassword from "@/Pages/auth/ResetPassword";
import Client from "@/Pages/Client";
import Guide from "@/Pages/Guide";
import Remote from "@/Pages/Remote";
import { CheckoutForm, Return } from "@/Pages/Membership";
import { Display } from "@/components/Display";
import { defaults } from "@/lib/constants";
import "@/components/global.scss"

Sentry.init({
  dsn: (import.meta as any).env.VITE_SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 1.0,
  tracePropagationTargets: ["localhost", /^https:\/\/daisy.samrod.com/, /^https:\/\/beta.daisyemdr.com/],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

const root = createRoot(document.getElementById("root"));

root.render(
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/checkout" element={<CheckoutForm />} />
        <Route path="/return" element={<Return />} />

        <Route path="/" element={<PrivateRoute><Guide /></PrivateRoute>} />
        <Route path="/thumb" element={<PrivateRoute><Display settings={defaults} /></PrivateRoute>} />
        <Route path="/remote" element={<PrivateRoute><Remote /></PrivateRoute>} />
        <Route path={`/:clientLink`} element={<Client />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
