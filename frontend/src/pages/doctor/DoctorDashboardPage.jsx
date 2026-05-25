import { useEffect, useState } from 'react';
import {
  ClipboardList,
  RefreshCw,
  Stethoscope,
  UserRoundCheck,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { getDoctorDashboard } from '../../api/dashboardApi';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import {
  getPrescriptionStatusLabel,
  getStatusTone,
} from '../../utils/statusLabels';

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

const DoctorDashboardPage = () => {
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      setError('');

      const data = await getDoctorDashboard();
      setDashboard(data.dashboard);
    } catch (err) {
      setError(err.message || 'Dashboard verileri alınamadı.');
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
        Doktor dashboard yükleniyor...
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

  const patientStats = dashboard?.patientStats || {};
  const prescriptionStats = dashboard?.prescriptionStats || {};
  const recentPrescriptions = dashboard?.recentPrescriptions || [];

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-600 to-emerald-500 p-6 text-white shadow-sm">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold text-blue-50">Doktor Paneli</p>
            <h1 className="mt-2 text-3xl font-bold">
              Merhaba, Dr. {user?.name}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-50">
              Bağlı hastalarınızı, reçetelerinizi ve hasta bağlantı durumlarını
              bu panelden takip edebilirsiniz.
            </p>
          </div>

          <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
            <p className="text-xs font-semibold text-blue-50">Uzmanlık</p>
            <p className="mt-1 text-2xl font-bold tracking-wide">
              {user?.specialization || '-'}
            </p>
            <p className="mt-1 text-xs text-blue-50">
              Hesap durumu: {user?.doctorStatus}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Bağlı Hasta"
          value={patientStats.connectedPatients || 0}
          description="Onaylı hasta bağlantısı"
          icon={Users}
          tone="blue"
        />

        <StatCard
          title="Bekleyen İstek"
          value={patientStats.pendingRequests || 0}
          description="Hasta onayı bekleyen istek"
          icon={UserRoundCheck}
          tone={patientStats.pendingRequests > 0 ? 'amber' : 'green'}
        />

        <StatCard
          title="Toplam Reçete"
          value={prescriptionStats.totalPrescriptions || 0}
          description="Oluşturduğunuz reçeteler"
          icon={ClipboardList}
          tone="green"
        />

        <StatCard
          title="Aktif Reçete"
          value={prescriptionStats.activePrescriptions || 0}
          description="Devam eden reçeteler"
          icon={Stethoscope}
          tone="blue"
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <Link
          to="/doctor/patients"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/30"
        >
          <p className="text-sm font-semibold text-slate-500">
            Hasta Yönetimi
          </p>
          <h2 className="mt-2 text-xl font-bold text-slate-900">
            Hastalarımı Gör
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Hasta koduyla arama yapın, bağlantı isteği gönderin ve bağlı
            hastalarınızı yönetin.
          </p>
        </Link>

        <Link
          to="/doctor/patients"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50/30"
        >
          <p className="text-sm font-semibold text-slate-500">Yeni Bağlantı</p>
          <h2 className="mt-2 text-xl font-bold text-slate-900">
            Hasta Kodu ile Ara
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Hastanın paylaştığı PAT kodu ile güvenli bağlantı isteği gönderin.
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
          <h2 className="text-lg font-bold text-slate-900">Son Reçeteler</h2>
          <p className="mt-1 text-sm text-slate-500">
            En son oluşturduğunuz reçeteler.
          </p>
        </div>

        <div className="overflow-x-auto">
          {recentPrescriptions.length > 0 ? (
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Hasta</th>
                  <th className="px-5 py-3">İlaç Sayısı</th>
                  <th className="px-5 py-3">Durum</th>
                  <th className="px-5 py-3">Tarih</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {recentPrescriptions.map((prescription) => (
                  <tr key={prescription._id}>
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900">
                        {prescription.patient?.name || '-'}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {prescription.patient?.patientCode || '-'}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {prescription.items?.length || 0}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge tone={getStatusTone(prescription.status)}>
                        {getPrescriptionStatusLabel(prescription.status)}
                      </StatusBadge>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {formatDate(prescription.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-5 text-sm text-slate-500">
              Henüz reçete oluşturmadınız.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default DoctorDashboardPage;