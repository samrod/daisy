import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import * as serviceWorker from "./serviceWorker";
import { AuthProvider } from "./context/AuthContext";

import PrivateRoute from "./Pages/auth/PrivateRoute";
import Signup from "./Pages/auth/Signup";
import Login from "./Pages/auth/Login";
import ForgotPassword from "./Pages/auth/ForgotPassword";
import ResetPassword from "./Pages/auth/ResetPassword";
import Client from "./Pages/Client";
import Guide from "./Pages/Guide";
import Remote from "./Pages/Remote";
import "./components/global.scss"

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
        <Route path="/remote" element={<PrivateRoute><Remote /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
