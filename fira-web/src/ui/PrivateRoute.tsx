import React from 'react';
import { RouteProps, Route, Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { RootState } from '../store/store';
import { UserRole } from '../store/user/user.slice';

type PrivateRouteProps = RouteProps & {
  requiredRole: UserRole;
};

const PrivateRoute: React.FC<PrivateRouteProps> = ({ requiredRole, ...rest }) => {
  const user = useSelector((state: RootState) => state.user);

  if (!!user && user?.role === requiredRole) {
    return <Route {...rest} />;
  } else {
    return <Redirect to="/" />;
  }
};

export default PrivateRoute;
