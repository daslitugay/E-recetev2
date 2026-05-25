import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ClipboardPlus, Mail, LockKeyhole, User, Stethoscope } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { getDefaultRouteByRole, USER_ROLES } from '../../utils/roles';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: USER_ROLES.PATIENT,
    specialization: '',
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={getDefaultRouteByRole(user)} replace />;
  }

  const isDoctor = formData.role === USER_ROLES.DOCTOR;

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

    if (!formData.name || !formData.email || !formData.password) {
      setError('Ad soyad, e-posta ve şifre alanları zorunludur.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    if (isDoctor && !formData.specialization.trim()) {
      setError('Doktor hesabı için uzmanlık alanı zorunludur.');
      return;
    }

    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
    };

    if (isDoctor) {
      payload.specialization = formData.specialization;
    }

    try {
      setIsSubmitting(true);
      const createdUser = await register(payload);

      navigate(getDefaultRouteByRole(createdUser), { replace: true });
    } catch (err) {
      setError(err.message || 'Kayıt olurken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="hidden flex-1 items-center justify-center bg-gradient-to-br from-emerald-500 to-blue-600 px-10 text-white lg:flex">
        <div className="max-w-lg">
          <div className="inline-flex rounded-2xl bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
            Dijital İlaç Dolabı
          </div>

          <h1 className="mt-8 text-4xl font-bold leading-tight">
            Evdeki ilaçlarınızı ve reçetelerinizi güvenli biçimde yönetin.
          </h1>

          <p className="mt-5 text-base leading-7 text-emerald-50">
            Hasta olarak ilaçlarınızı takip edin, doktor olarak onaylı
            hastalarınıza reçete oluşturun.
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <ClipboardPlus size={24} />
            </div>

            <h1 className="text-2xl font-bold text-slate-900">Kayıt Ol</h1>
            <p className="mt-2 text-sm text-slate-500">
              Hasta veya doktor hesabı oluşturun.
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
                htmlFor="name"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Ad Soyad
              </label>

              <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50">
                <User size={18} className="text-slate-400" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Adınızı yazın"
                  className="w-full border-0 bg-transparent px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

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
                  placeholder="En az 6 karakter"
                  className="w-full border-0 bg-transparent px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="role"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Hesap Türü
              </label>

              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              >
                <option value={USER_ROLES.PATIENT}>Hasta</option>
                <option value={USER_ROLES.DOCTOR}>Doktor</option>
              </select>
            </div>

            {isDoctor && (
              <div>
                <label
                  htmlFor="specialization"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Uzmanlık Alanı
                </label>

                <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50">
                  <Stethoscope size={18} className="text-slate-400" />
                  <input
                    id="specialization"
                    name="specialization"
                    type="text"
                    value={formData.specialization}
                    onChange={handleChange}
                    placeholder="Örn. Aile Hekimi"
                    className="w-full border-0 bg-transparent px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-700"
            >
              {isSubmitting ? 'Hesap oluşturuluyor...' : 'Kayıt Ol'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Zaten hesabınız var mı?{' '}
            <Link to="/login" className="font-bold text-blue-600">
              Giriş yapın
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;