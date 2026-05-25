import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { getDefaultRouteByRole } from '../utils/roles';

const RoleRoute = ({ allowedRoles }) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={getDefaultRouteByRole(user)} replace />;
  }

  return <Outlet />;
};

export default RoleRoute;