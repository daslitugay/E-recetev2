import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { USER_ROLES, getDefaultRouteByRole } from '../utils/roles';

const AppLayout = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const patientLinks = [
    { label: 'Dashboard', to: '/patient/dashboard' },
    { label: 'İlaçlarım', to: '/patient/medicines' },
    { label: 'Reçetelerim', to: '/patient/prescriptions' },
    { label: 'Doktorlarım', to: '/patient/doctors' },
  ];

  const doctorLinks = [
    { label: 'Dashboard', to: '/doctor/dashboard' },
    { label: 'Hastalarım', to: '/doctor/patients' },
    { label: 'Reçete Oluştur', to: '/doctor/prescriptions/create' },
    { label: 'Reçetelerim', to: '/doctor/prescriptions' },
  ];

  const adminLinks = [
    { label: 'Dashboard', to: '/admin/dashboard' },
    { label: 'Doktor Onayları', to: '/admin/doctors' },
    { label: 'Kullanıcılar', to: '/admin/users' },
  ];

  const linksByRole = {
    [USER_ROLES.PATIENT]: patientLinks,
    [USER_ROLES.DOCTOR]: doctorLinks,
    [USER_ROLES.ADMIN]: adminLinks,
  };

  const activeLinks = linksByRole[user?.role] || [];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between gap-4">
            <Link
              to={getDefaultRouteByRole(user)}
              className="text-lg font-bold text-blue-600"
            >
              E-Reçete
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 lg:hidden"
            >
              Çıkış
            </button>
          </div>

          <nav className="flex flex-wrap gap-2">
            {activeLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-2 text-sm font-bold transition ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-4 lg:flex">
            <div className="text-right">
              <Link
                to="/profile"
                className="text-sm font-semibold text-slate-900 hover:text-blue-600"
              >
                {user?.name}
              </Link>
              <p className="text-xs text-slate-500">{user?.role}</p>
            </div>

            <Link
              to="/profile"
              className="rounded-xl border border-blue-100 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
            >
              Profil
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Çıkış
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;