import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  Eye,
  Plus,
  RefreshCw,
  Search,
  UserRound,
} from 'lucide-react';

import { getDoctorPrescriptions } from '../../api/prescriptionApi';
import StatusBadge from '../../components/ui/StatusBadge';
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

const getPrescriptionStockSummary = (items = []) => {
  const summary = {
    enough: 0,
    lowStock: 0,
    notFound: 0,
    expired: 0,
    outOfStock: 0,
  };

  items.forEach((item) => {
    if (item.stockStatus === 'ENOUGH') {
      summary.enough += 1;
    }

    if (item.stockStatus === 'LOW_STOCK') {
      summary.lowStock += 1;
    }

    if (item.stockStatus === 'NOT_FOUND') {
      summary.notFound += 1;
    }

    if (item.stockStatus === 'EXPIRED') {
      summary.expired += 1;
    }

    if (item.stockStatus === 'OUT_OF_STOCK') {
      summary.outOfStock += 1;
    }
  });

  return summary;
};

const DoctorPrescriptionsPage = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPrescriptions = async () => {
    try {
      setIsLoading(true);
      setError('');

      const data = await getDoctorPrescriptions();
      setPrescriptions(data.prescriptions || []);
    } catch (err) {
      setError(err.message || 'Reçeteler alınamadı.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const filteredPrescriptions = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return prescriptions.filter((prescription) => {
      const patientName = prescription.patient?.name || '';
      const patientCode = prescription.patient?.patientCode || '';
      const diagnosisNote = prescription.diagnosisNote || '';
      const generalNote = prescription.generalNote || '';
      const medicineNames = prescription.items
        ?.map((item) => item.medicineName)
        .join(' ');

      const searchableText = `
        ${patientName}
        ${patientCode}
        ${diagnosisNote}
        ${generalNote}
        ${medicineNames}
      `.toLowerCase();

      const matchesSearch = query ? searchableText.includes(query) : true;
      const matchesStatus =
        statusFilter === 'ALL' ? true : prescription.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [prescriptions, searchTerm, statusFilter]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-500">
        Reçeteler yükleniyor...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center">
        <div>
          <p className="text-sm font-semibold text-blue-600">Doktor Paneli</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            Reçetelerim
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Oluşturduğunuz reçeteleri, hasta bilgilerini ve stok eşleşme
            durumlarını görüntüleyin.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={loadPrescriptions}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw size={17} />
            Yenile
          </button>

          <Link
            to="/doctor/prescriptions/create"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
          >
            <Plus size={17} />
            Yeni Reçete
          </Link>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Toplam Reçete</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {prescriptions.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Aktif Reçete</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {
              prescriptions.filter(
                (prescription) => prescription.status === 'ACTIVE'
              ).length
            }
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">
            Kritik Stok İçeren
          </p>
          <p className="mt-2 text-3xl font-bold text-amber-600">
            {
              prescriptions.filter((prescription) =>
                prescription.items?.some((item) =>
                  ['LOW_STOCK', 'NOT_FOUND', 'OUT_OF_STOCK', 'EXPIRED'].includes(
                    item.stockStatus
                  )
                )
              ).length
            }
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Reçete Listesi</h2>
            <p className="mt-1 text-sm text-slate-500">
              Toplam {filteredPrescriptions.length} kayıt gösteriliyor.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
            >
              <option value="ALL">Tüm Durumlar</option>
              <option value="ACTIVE">Aktif</option>
              <option value="COMPLETED">Tamamlandı</option>
              <option value="CANCELLED">İptal edildi</option>
            </select>

            <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50">
              <Search size={18} className="text-slate-400" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Reçete ara..."
                className="w-full min-w-[220px] border-0 bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {filteredPrescriptions.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredPrescriptions.map((prescription) => {
              const stockSummary = getPrescriptionStockSummary(
                prescription.items
              );

              return (
                <div key={prescription._id} className="p-5">
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                          <UserRound size={20} />
                        </div>

                        <div>
                          <p className="font-bold text-slate-900">
                            {prescription.patient?.name || '-'}
                          </p>
                          <p className="text-sm text-slate-500">
                            {prescription.patient?.patientCode || '-'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <StatusBadge tone={getStatusTone(prescription.status)}>
                          {getPrescriptionStatusLabel(prescription.status)}
                        </StatusBadge>

                        <StatusBadge tone="blue">
                          {prescription.items?.length || 0} ilaç
                        </StatusBadge>

                        {stockSummary.enough > 0 && (
                          <StatusBadge tone="green">
                            {stockSummary.enough} yeterli
                          </StatusBadge>
                        )}

                        {stockSummary.lowStock > 0 && (
                          <StatusBadge tone="amber">
                            {stockSummary.lowStock} eksik
                          </StatusBadge>
                        )}

                        {stockSummary.notFound > 0 && (
                          <StatusBadge tone="red">
                            {stockSummary.notFound} yok
                          </StatusBadge>
                        )}

                        {stockSummary.outOfStock > 0 && (
                          <StatusBadge tone="red">
                            {stockSummary.outOfStock} stok bitti
                          </StatusBadge>
                        )}

                        {stockSummary.expired > 0 && (
                          <StatusBadge tone="red">
                            {stockSummary.expired} tarihi geçmiş
                          </StatusBadge>
                        )}
                      </div>

                      {prescription.diagnosisNote && (
                        <p className="mt-4 max-w-3xl text-sm text-slate-600">
                          <span className="font-bold text-slate-800">
                            Not:
                          </span>{' '}
                          {prescription.diagnosisNote}
                        </p>
                      )}

                      <p className="mt-3 text-xs text-slate-400">
                        Oluşturulma: {formatDate(prescription.createdAt)}
                      </p>
                    </div>

                    <Link
                      to={`/doctor/prescriptions/${prescription._id}`}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
                    >
                      <Eye size={17} />
                      Detay Gör
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <ClipboardList size={24} />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">
              Reçete bulunmuyor
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              İlk reçetenizi oluşturduğunuzda burada görünecek.
            </p>

            <Link
              to="/doctor/prescriptions/create"
              className="mt-5 inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
            >
              Reçete Oluştur
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default DoctorPrescriptionsPage;