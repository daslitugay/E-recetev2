import { useEffect, useMemo, useState } from 'react';
import {
  RefreshCw,
  Search,
  ShieldCheck,
  Stethoscope,
  UserRound,
  Users,
} from 'lucide-react';

import { getAdminUsers } from '../../api/adminApi';
import StatusBadge from '../../components/ui/StatusBadge';

const formatDate = (date) => {
  if (!date) {
    return '-';
  }

  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

const getRoleTone = (role) => {
  if (role === 'ADMIN') {
    return 'blue';
  }

  if (role === 'DOCTOR') {
    return 'green';
  }

  return 'slate';
};

const getDoctorStatusTone = (status) => {
  if (status === 'APPROVED') {
    return 'green';
  }

  if (status === 'PENDING') {
    return 'amber';
  }

  if (status === 'REJECTED') {
    return 'red';
  }

  return 'slate';
};

const getRoleIcon = (role) => {
  if (role === 'ADMIN') {
    return ShieldCheck;
  }

  if (role === 'DOCTOR') {
    return Stethoscope;
  }

  return UserRound;
};

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError('');

      const data = await getAdminUsers();
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message || 'Kullanıcılar alınamadı.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return users.filter((user) => {
      const searchableText = `
        ${user.name}
        ${user.email}
        ${user.role}
        ${user.patientCode || ''}
        ${user.specialization || ''}
        ${user.doctorStatus || ''}
      `.toLowerCase();

      const matchesSearch = query ? searchableText.includes(query) : true;
      const matchesRole = roleFilter === 'ALL' ? true : user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const stats = useMemo(() => {
    return {
      total: users.length,
      patients: users.filter((user) => user.role === 'PATIENT').length,
      doctors: users.filter((user) => user.role === 'DOCTOR').length,
      admins: users.filter((user) => user.role === 'ADMIN').length,
    };
  }, [users]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-500">
        Kullanıcılar yükleniyor...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center">
        <div>
          <p className="text-sm font-semibold text-blue-600">Admin Paneli</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            Kullanıcılar
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Sistemdeki hasta, doktor ve admin hesaplarını görüntüleyin.
          </p>
        </div>

        <button
          type="button"
          onClick={loadUsers}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
        >
          <RefreshCw size={17} />
          Yenile
        </button>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Toplam</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {stats.total}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Hasta</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {stats.patients}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Doktor</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">
            {stats.doctors}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Admin</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {stats.admins}
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Kullanıcı Listesi
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Toplam {filteredUsers.length} kayıt gösteriliyor.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
            >
              <option value="ALL">Tüm Roller</option>
              <option value="PATIENT">Hasta</option>
              <option value="DOCTOR">Doktor</option>
              <option value="ADMIN">Admin</option>
            </select>

            <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50">
              <Search size={18} className="text-slate-400" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Kullanıcı ara..."
                className="w-full min-w-[220px] border-0 bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Kullanıcı</th>
                  <th className="px-5 py-3">Rol</th>
                  <th className="px-5 py-3">Hasta Kodu</th>
                  <th className="px-5 py-3">Doktor Durumu</th>
                  <th className="px-5 py-3">Aktif</th>
                  <th className="px-5 py-3">Kayıt Tarihi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => {
                  const Icon = getRoleIcon(user.role);

                  return (
                    <tr key={user._id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                            <Icon size={20} />
                          </div>

                          <div>
                            <p className="font-bold text-slate-900">
                              {user.name}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {user.email}
                            </p>
                            {user.specialization && (
                              <p className="mt-1 text-xs font-semibold text-emerald-600">
                                {user.specialization}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge tone={getRoleTone(user.role)}>
                          {user.role}
                        </StatusBadge>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {user.patientCode || '-'}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge tone={getDoctorStatusTone(user.doctorStatus)}>
                          {user.doctorStatus || '-'}
                        </StatusBadge>
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge tone={user.isActive ? 'green' : 'red'}>
                          {user.isActive ? 'Aktif' : 'Pasif'}
                        </StatusBadge>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {formatDate(user.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Users size={24} />
            </div>

            <h3 className="mt-4 text-lg font-bold text-slate-900">
              Kullanıcı bulunamadı
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Arama veya filtre kriterlerinizi değiştirin.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminUsersPage;