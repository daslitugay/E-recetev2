import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CalendarClock,
  ClipboardList,
  Pill,
  RefreshCw,
  Stethoscope,
  UserRoundCheck,
} from 'lucide-react';

import { getPatientDashboard } from '../../api/dashboardApi';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import {
  getExpiryStatusLabel,
  getPrescriptionStatusLabel,
  getStatusTone,
  getStockStatusLabel,
} from '../../utils/statusLabels';

const formatDate = (date) => {
  if (!date) {
    return '-';
  }

  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
};

const PatientDashboardPage = () => {
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      setError('');

      const data = await getPatientDashboard();
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
        Dashboard yükleniyor...
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

  const medicineStats = dashboard?.medicineStats || {};
  const prescriptionStats = dashboard?.prescriptionStats || {};
  const connectionStats = dashboard?.connectionStats || {};

  const lowStockTotal =
    Number(medicineStats.lowStock || 0) + Number(medicineStats.outOfStock || 0);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-600 to-emerald-500 p-6 text-white shadow-sm">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold text-blue-50">Hasta Paneli</p>
            <h1 className="mt-2 text-3xl font-bold">
              Merhaba, {user?.name}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-50">
              İlaç dolabınızı, reçetelerinizi ve doktor bağlantılarınızı bu
              panelden takip edebilirsiniz.
            </p>
          </div>

          <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
            <p className="text-xs font-semibold text-blue-50">Hasta Kodunuz</p>
            <p className="mt-1 text-2xl font-bold tracking-wide">
              {user?.patientCode || '-'}
            </p>
            <p className="mt-1 text-xs text-blue-50">
              Doktorunuz bağlantı isteği için bu kodu kullanır.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Toplam İlaç"
          value={medicineStats.totalMedicines || 0}
          description="Dijital ilaç dolabınızdaki kayıt"
          icon={Pill}
          tone="blue"
        />

        <StatCard
          title="Stok Uyarısı"
          value={lowStockTotal}
          description="Azalan veya biten ilaç"
          icon={AlertTriangle}
          tone={lowStockTotal > 0 ? 'amber' : 'green'}
        />

        <StatCard
          title="SKT Yaklaşan"
          value={medicineStats.expiringSoon || 0}
          description="30 gün içinde dikkat isteyen"
          icon={CalendarClock}
          tone={medicineStats.expiringSoon > 0 ? 'amber' : 'green'}
        />

        <StatCard
          title="Aktif Reçete"
          value={prescriptionStats.activePrescriptions || 0}
          description="Devam eden reçeteler"
          icon={ClipboardList}
          tone="green"
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Stethoscope size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">
                Bağlı Doktor
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {connectionStats.connectedDoctors || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <UserRoundCheck size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">
                Bekleyen Doktor İsteği
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {connectionStats.pendingRequests || 0}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={loadDashboard}
          className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-5 text-sm font-bold text-slate-600 shadow-sm hover:bg-slate-50"
        >
          <RefreshCw size={18} />
          Verileri Yenile
        </button>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <h2 className="text-lg font-bold text-slate-900">
              Son Kullanma Tarihi Yaklaşanlar
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              30 gün içinde kontrol edilmesi gereken ilaçlar.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {dashboard?.upcomingExpiryMedicines?.length > 0 ? (
              dashboard.upcomingExpiryMedicines.map((medicine) => (
                <div
                  key={medicine._id}
                  className="flex items-center justify-between gap-4 p-5"
                >
                  <div>
                    <p className="font-bold text-slate-900">
                      {medicine.name} {medicine.dosage}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      SKT: {formatDate(medicine.expiryDate)} • Kalan:{' '}
                      {medicine.remainingUnits}
                    </p>
                  </div>

                  <StatusBadge tone={getStatusTone(medicine.expiryStatus)}>
                    {getExpiryStatusLabel(medicine.expiryStatus)}
                  </StatusBadge>
                </div>
              ))
            ) : (
              <div className="p-5 text-sm text-slate-500">
                Yaklaşan son kullanma tarihi olan ilaç yok.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <h2 className="text-lg font-bold text-slate-900">
              Stok Uyarıları
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Azalan veya biten ilaçlar.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {dashboard?.lowStockMedicines?.length > 0 ? (
              dashboard.lowStockMedicines.map((medicine) => (
                <div
                  key={medicine._id}
                  className="flex items-center justify-between gap-4 p-5"
                >
                  <div>
                    <p className="font-bold text-slate-900">
                      {medicine.name} {medicine.dosage}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Kalan: {medicine.remainingUnits} / Toplam:{' '}
                      {medicine.totalUnits}
                    </p>
                  </div>

                  <StatusBadge tone={getStatusTone(medicine.stockStatus)}>
                    {getStockStatusLabel(medicine.stockStatus)}
                  </StatusBadge>
                </div>
              ))
            ) : (
              <div className="p-5 text-sm text-slate-500">
                Stok uyarısı bulunan ilaç yok.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-lg font-bold text-slate-900">Son Reçeteler</h2>
          <p className="mt-1 text-sm text-slate-500">
            Doktorlarınız tarafından oluşturulan son reçeteler.
          </p>
        </div>

        <div className="overflow-x-auto">
          {dashboard?.recentPrescriptions?.length > 0 ? (
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Doktor</th>
                  <th className="px-5 py-3">İlaç Sayısı</th>
                  <th className="px-5 py-3">Durum</th>
                  <th className="px-5 py-3">Tarih</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {dashboard.recentPrescriptions.map((prescription) => (
                  <tr key={prescription._id}>
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900">
                        {prescription.doctor?.name || '-'}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {prescription.doctor?.specialization || '-'}
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
              Henüz reçete bulunmuyor.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default PatientDashboardPage;