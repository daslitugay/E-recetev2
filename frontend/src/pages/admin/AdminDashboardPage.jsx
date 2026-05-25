import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  Pill,
  RefreshCw,
  ShieldCheck,
  Stethoscope,
  UserRound,
  Users,
} from 'lucide-react';

import { getAdminDashboard } from '../../api/dashboardApi';
import StatCard from '../../components/ui/StatCard';
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

const AdminDashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      setError('');

      const data = await getAdminDashboard();
      setDashboard(data.dashboard);
    } catch (err) {
      setError(err.message || 'Admin dashboard verileri alınamadı.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-500">
        Admin dashboard yükleniyor...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-red-700">
        <p className="font-bold">Bir hata oluştu</p>
        <p className="mt-1 text-sm">{error}</p>

        <button
          type="button"
          onClick={loadDashboard}
          className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  const userStats = dashboard?.userStats || {};
  const systemStats = dashboard?.systemStats || {};
  const recentDoctors = dashboard?.recentDoctors || [];

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-600 to-emerald-500 p-6 text-white shadow-sm">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold text-blue-50">Admin Paneli</p>
            <h1 className="mt-2 text-3xl font-bold">
              Sistem Yönetim Merkezi
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-50">
              Kullanıcıları, doktor onaylarını ve sistem genelindeki temel
              istatistikleri buradan takip edebilirsiniz.
            </p>
          </div>

          <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
            <p className="text-xs font-semibold text-blue-50">Bekleyen Doktor</p>
            <p className="mt-1 text-3xl font-bold tracking-wide">
              {userStats.pendingDoctors || 0}
            </p>
            <p className="mt-1 text-xs text-blue-50">
              Onay bekleyen hesap sayısı
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Toplam Kullanıcı"
          value={userStats.totalUsers || 0}
          description="Sistemdeki tüm hesaplar"
          icon={Users}
          tone="blue"
        />

        <StatCard
          title="Hasta"
          value={userStats.totalPatients || 0}
          description="Kayıtlı hasta hesapları"
          icon={UserRound}
          tone="green"
        />

        <StatCard
          title="Doktor"
          value={userStats.totalDoctors || 0}
          description="Tüm doktor hesapları"
          icon={Stethoscope}
          tone="blue"
        />

        <StatCard
          title="Onay Bekleyen"
          value={userStats.pendingDoctors || 0}
          description="Admin aksiyonu bekleyen doktor"
          icon={ShieldCheck}
          tone={userStats.pendingDoctors > 0 ? 'amber' : 'green'}
        />
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        <StatCard
          title="Toplam İlaç Kaydı"
          value={systemStats.totalMedicines || 0}
          description="Tüm hastaların ilaç kayıtları"
          icon={Pill}
          tone="green"
        />

        <StatCard
          title="Toplam Reçete"
          value={systemStats.totalPrescriptions || 0}
          description="Sistemde oluşturulan reçeteler"
          icon={ClipboardList}
          tone="blue"
        />

        <StatCard
          title="Aktif Reçete"
          value={systemStats.activePrescriptions || 0}
          description="Devam eden reçeteler"
          icon={ClipboardList}
          tone="amber"
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <Link
          to="/admin/doctors"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/30"
        >
          <p className="text-sm font-semibold text-slate-500">
            Doktor Yönetimi
          </p>
          <h2 className="mt-2 text-xl font-bold text-slate-900">
            Doktor Onaylarını Gör
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Yeni doktor başvurularını onaylayın veya reddedin.
          </p>
        </Link>

        <Link
          to="/admin/users"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50/30"
        >
          <p className="text-sm font-semibold text-slate-500">
            Kullanıcı Yönetimi
          </p>
          <h2 className="mt-2 text-xl font-bold text-slate-900">
            Kullanıcıları Listele
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Hasta, doktor ve admin hesaplarını görüntüleyin.
          </p>
        </Link>

        <button
          type="button"
          onClick={loadDashboard}
          className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-5 text-sm font-bold text-slate-600 shadow-sm hover:bg-slate-50"
        >
          <RefreshCw size={18} />
          Verileri Yenile
        </button>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-lg font-bold text-slate-900">
            Son Doktor Kayıtları
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Sisteme en son kayıt olan doktor hesapları.
          </p>
        </div>

        <div className="overflow-x-auto">
          {recentDoctors.length > 0 ? (
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Doktor</th>
                  <th className="px-5 py-3">Uzmanlık</th>
                  <th className="px-5 py-3">Durum</th>
                  <th className="px-5 py-3">Kayıt Tarihi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {recentDoctors.map((doctor) => (
                  <tr key={doctor._id}>
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900">{doctor.name}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {doctor.email}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {doctor.specialization || '-'}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge tone={getDoctorStatusTone(doctor.doctorStatus)}>
                        {doctor.doctorStatus}
                      </StatusBadge>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {formatDate(doctor.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-5 text-sm text-slate-500">
              Henüz doktor kaydı bulunmuyor.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboardPage;