import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route } from 'react-router-dom';
import './components/global.scss'
import * as serviceWorker from './serviceWorker';
import { AuthProvider } from './context/AuthContext';

import PrivateRoute from './Pages/auth/PrivateRoute';
import Signup from './Pages/auth/Signup';
import Login from './Pages/auth/Login';
import Account from './Pages/auth/Account';
import ForgotPassword from './Pages/auth/ForgotPassword';
import ResetPassword from './Pages/auth/ResetPassword';
import Display from './Pages/Display';
import Remote from './Pages/Remote';

ReactDOM.render((
  <AuthProvider>
      <BrowserRouter>
        <Route path="/signup" component={Signup} />
        <Route path="/login" component={Login} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/reset-password" component={ResetPassword} />
        <PrivateRoute path="/account" component={Account} />

        <PrivateRoute exact path="/" component={Display} />
        <PrivateRoute path="/embedded" component={Remote} />
        <PrivateRoute path="/remote" component={Remote} />
    </BrowserRouter>
  </AuthProvider>
), document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
