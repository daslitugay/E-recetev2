import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';

const DoctorPendingApprovalPage = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-blue-100 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          ⏳
        </div>

        <h1 className="mt-5 text-2xl font-bold text-slate-900">
          Doktor hesabınız onay bekliyor
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          Merhaba {user?.name}. Hesabınız admin tarafından onaylandıktan sonra
          doktor paneline erişebilirsiniz.
        </p>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Çıkış Yap
        </button>
      </div>
    </div>
  );
};

export default DoctorPendingApprovalPage;