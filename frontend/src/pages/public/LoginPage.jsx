import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { LogIn, Mail, LockKeyhole } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { getDefaultRouteByRole } from '../../utils/roles';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={getDefaultRouteByRole(user)} replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('E-posta ve şifre alanları zorunludur.');
      return;
    }

    try {
      setIsSubmitting(true);
      const loggedInUser = await login(formData);

      navigate(getDefaultRouteByRole(loggedInUser), { replace: true });
    } catch (err) {
      setError(err.message || 'Giriş yapılırken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="hidden flex-1 items-center justify-center bg-gradient-to-br from-blue-600 to-emerald-500 px-10 text-white lg:flex">
        <div className="max-w-lg">
          <div className="inline-flex rounded-2xl bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
            E-Reçete Sağlık Paneli
          </div>

          <h1 className="mt-8 text-4xl font-bold leading-tight">
            İlaçlar, reçeteler ve doktor bağlantıları tek sade panelde.
          </h1>

          <p className="mt-5 text-base leading-7 text-blue-50">
            Kişisel ilaç dolabınızı takip edin, reçetelerinizi görün ve sağlık
            yönetiminizi daha kontrollü hale getirin.
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <LogIn size={24} />
            </div>

            <h1 className="text-2xl font-bold text-slate-900">Giriş Yap</h1>
            <p className="mt-2 text-sm text-slate-500">
              E-Reçete hesabınıza giriş yapın.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                E-posta
              </label>

              <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50">
                <Mail size={18} className="text-slate-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ornek@mail.com"
                  className="w-full border-0 bg-transparent px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Şifre
              </label>

              <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50">
                <LockKeyhole size={18} className="text-slate-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full border-0 bg-transparent px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
            >
              {isSubmitting ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Hesabınız yok mu?{' '}
            <Link to="/register" className="font-bold text-blue-600">
              Kayıt olun
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;