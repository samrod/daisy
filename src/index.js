import { createRoot } from "react-dom/client";
import { BrowserRouter, Route } from "react-router-dom";

import * as serviceWorker from "./serviceWorker";
import { AuthProvider } from "./context/AuthContext";

import PrivateRoute from "./Pages/auth/PrivateRoute";
import Signup from "./Pages/auth/Signup";
import Login from "./Pages/auth/Login";
import Account from "./Pages/settings/Account";
import ForgotPassword from "./Pages/auth/ForgotPassword";
import ResetPassword from "./Pages/auth/ResetPassword";
import Display from "./Pages/Display";
import RemoteHeader from "./Pages/RemoteIframeHeader";
import Remote from "./Pages/Remote";
import "./components/global.scss"

const root = createRoot(document.getElementById("root"));

root.render(
  <AuthProvider>
      <BrowserRouter>
        <Route path="/signup" component={Signup} />
        <Route path="/login" component={Login} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/reset-password" component={ResetPassword} />
        <PrivateRoute path="/account" component={Account} />

        <PrivateRoute exact path="/" component={Display} />
        <PrivateRoute path="/embedded" component={RemoteHeader} />
        <PrivateRoute path="/remote" component={Remote} />
    </BrowserRouter>
  </AuthProvider>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
