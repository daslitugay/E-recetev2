import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { getDefaultRouteByRole } from '../utils/roles';

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        Yükleniyor...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'DOCTOR' && user?.doctorStatus !== 'APPROVED') {
    return <Navigate to={getDefaultRouteByRole(user)} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;