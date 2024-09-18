import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import * as serviceWorker from "./serviceWorker";
import * as Sentry from "@sentry/react";
import { AuthProvider } from "./context/AuthContext";

import PrivateRoute from "./Pages/auth/PrivateRoute";
import Signup from "./Pages/auth/Signup";
import Login from "./Pages/auth/Login";
import ForgotPassword from "./Pages/auth/ForgotPassword";
import ResetPassword from "./Pages/auth/ResetPassword";
import Client from "./Pages/Client";
import Guide from "./Pages/Guide";
import Remote from "./Pages/Remote";
import { Display } from "components/Display";
import "components/global.scss"

Sentry.init({
  dsn: "https://e86aec34d27a5331ba6969622acc24b4@o4507972650991616.ingest.us.sentry.io/4507972653023232",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Tracing
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ["localhost", /^https:\/\/daisy.samrod.com/, /^https:\/\/beta.daisyemdr.com/],
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
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

        <Route path={`/:clientLink`} element={<Client />} />
        <Route path="/" element={<PrivateRoute><Guide /></PrivateRoute>} />
        <Route path="/thumb" element={<PrivateRoute><Display /></PrivateRoute>} />
        <Route path="/remote" element={<PrivateRoute><Remote /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
