import React from 'react'
import { Route, Redirect } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute = ({ component: Component, ...rest }: { component: React.ComponentType }) => {
  const { currentUser } = useAuth();
  const routeUser = (props: React.ComponentProps<any>) => (
      currentUser === null
        ? <Redirect to="/login" />
        : <Component {...props} />
      );

  return (
    <Route {...rest} render={routeUser} />
  )
};

export default PrivateRoute;
