import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  PackageCheck,
  PackageX,
  RefreshCw,
  Save,
  UserRound,
} from 'lucide-react';

import {
  getPrescriptionById,
  refreshPrescriptionStock,
  updatePrescriptionStatus,
} from '../../api/prescriptionApi';
import StatusBadge from '../../components/ui/StatusBadge';
import {
  getExpiryStatusLabel,
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

const getStockLabel = (status) => {
  const labels = {
    ENOUGH: 'Hastada yeterli miktarda var',
    LOW_STOCK: 'Hastada var ama miktar eksik',
    NOT_FOUND: 'Hastanın dolabında bulunmuyor',
    OUT_OF_STOCK: 'Hastada var ama stok bitmiş',
    EXPIRED: 'Hastada var ama son kullanma tarihi geçmiş',
  };

  return labels[status] || status || '-';
};

const getItemTone = (status) => {
  if (status === 'ENOUGH') {
    return 'green';
  }

  if (status === 'LOW_STOCK') {
    return 'amber';
  }

  if (['NOT_FOUND', 'OUT_OF_STOCK', 'EXPIRED'].includes(status)) {
    return 'red';
  }

  return 'slate';
};

const getItemIcon = (status) => {
  if (status === 'ENOUGH') {
    return CheckCircle2;
  }

  if (status === 'LOW_STOCK') {
    return PackageCheck;
  }

  return PackageX;
};

const DoctorPrescriptionDetailPage = () => {
  const { id } = useParams();

  const [prescription, setPrescription] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('ACTIVE');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadPrescription = async () => {
    try {
      setIsLoading(true);
      setError('');
      setMessage('');

      const data = await getPrescriptionById(id);
      setPrescription(data.prescription);
      setSelectedStatus(data.prescription?.status || 'ACTIVE');
    } catch (err) {
      setError(err.message || 'Reçete detayı alınamadı.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPrescription();
  }, [id]);

  const summary = useMemo(() => {
    const items = prescription?.items || [];

    return {
      total: items.length,
      enough: items.filter((item) => item.stockStatus === 'ENOUGH').length,
      warning: items.filter((item) => item.stockStatus === 'LOW_STOCK').length,
      critical: items.filter((item) =>
        ['NOT_FOUND', 'OUT_OF_STOCK', 'EXPIRED'].includes(item.stockStatus)
      ).length,
    };
  }, [prescription]);

  const handleRefreshStock = async () => {
    try {
      setIsRefreshing(true);
      setError('');
      setMessage('');

      const data = await refreshPrescriptionStock(id);
      setPrescription(data.prescription);
      setSelectedStatus(data.prescription?.status || 'ACTIVE');
      setMessage('Stok durumu güncellendi.');
    } catch (err) {
      setError(err.message || 'Stok durumu yenilenemedi.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedStatus) {
      setError('Lütfen reçete durumu seçin.');
      return;
    }

    try {
      setIsUpdatingStatus(true);
      setError('');
      setMessage('');

      const data = await updatePrescriptionStatus(id, selectedStatus);
      setPrescription((prev) => ({
        ...prev,
        status: data.prescription.status,
      }));
      setMessage('Reçete durumu güncellendi.');
    } catch (err) {
      setError(err.message || 'Reçete durumu güncellenemedi.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-500">
        Reçete detayı yükleniyor...
      </div>
    );
  }

  if (error && !prescription) {
    return (
      <div className="space-y-4">
        <Link
          to="/doctor/prescriptions"
          className="inline-flex items-center gap-2 text-sm font-bold text-blue-600"
        >
          <ArrowLeft size={17} />
          Reçetelere Dön
        </Link>

        <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-red-700">
          <p className="font-bold">Bir hata oluştu</p>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center">
        <div>
          <Link
            to="/doctor/prescriptions"
            className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-blue-600"
          >
            <ArrowLeft size={17} />
            Reçetelere Dön
          </Link>

          <p className="text-sm font-semibold text-blue-600">Reçete Detayı</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            {prescription?.patient?.name || '-'}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {prescription?.patient?.patientCode || '-'} •{' '}
            {formatDate(prescription?.createdAt)}
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <StatusBadge tone={getStatusTone(prescription?.status)}>
            {getPrescriptionStatusLabel(prescription?.status)}
          </StatusBadge>

          <button
            type="button"
            onClick={handleRefreshStock}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw size={17} />
            {isRefreshing ? 'Yenileniyor...' : 'Stok Durumunu Yenile'}
          </button>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          {message}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Toplam İlaç</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {summary.total}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Yeterli</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">
            {summary.enough}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Eksik</p>
          <p className="mt-2 text-3xl font-bold text-amber-600">
            {summary.warning}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Kritik</p>
          <p className="mt-2 text-3xl font-bold text-red-600">
            {summary.critical}
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <ClipboardList size={20} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Reçete Notları
              </h2>
              <p className="text-sm text-slate-500">
                Reçeteye eklenen açıklamalar.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Tanı / Açıklama
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {prescription?.diagnosisNote || 'Not eklenmemiş.'}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Genel Not
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {prescription?.generalNote || 'Not eklenmemiş.'}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <UserRound size={20} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">Hasta</h2>
              <p className="text-sm text-slate-500">Reçete sahibi</p>
            </div>
          </div>

          <div className="mt-5 space-y-2 text-sm">
            <p>
              <span className="font-bold text-slate-800">Ad:</span>{' '}
              <span className="text-slate-600">
                {prescription?.patient?.name || '-'}
              </span>
            </p>

            <p>
              <span className="font-bold text-slate-800">Hasta Kodu:</span>{' '}
              <span className="text-slate-600">
                {prescription?.patient?.patientCode || '-'}
              </span>
            </p>

            <p>
              <span className="font-bold text-slate-800">E-posta:</span>{' '}
              <span className="text-slate-600">
                {prescription?.patient?.email || '-'}
              </span>
            </p>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-5">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Reçete Durumu
            </label>

            <select
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
            >
              <option value="ACTIVE">Aktif</option>
              <option value="COMPLETED">Tamamlandı</option>
              <option value="CANCELLED">İptal edildi</option>
            </select>

            <button
              type="button"
              onClick={handleUpdateStatus}
              disabled={
                isUpdatingStatus || selectedStatus === prescription?.status
              }
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Save size={17} />
              {isUpdatingStatus ? 'Güncelleniyor...' : 'Durumu Güncelle'}
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-lg font-bold text-slate-900">
            Reçetedeki İlaçlar
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            İlaçlar, hastanın dijital ilaç dolabıyla karşılaştırılmıştır.
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {prescription?.items?.map((item) => {
            const Icon = getItemIcon(item.stockStatus);

            return (
              <div key={item._id} className="p-5">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                        getItemTone(item.stockStatus) === 'green'
                          ? 'bg-emerald-50 text-emerald-600'
                          : getItemTone(item.stockStatus) === 'amber'
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-red-50 text-red-600'
                      }`}
                    >
                      <Icon size={23} />
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {item.medicineName} {item.dosage}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {item.form} • Günde {item.frequencyPerDay} kez •{' '}
                        {item.durationDays} gün • Doz başı {item.unitsPerDose}{' '}
                        adet
                      </p>

                      {item.usageInstruction && (
                        <p className="mt-3 max-w-3xl rounded-2xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">
                          {item.usageInstruction}
                        </p>
                      )}

                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-slate-100 p-3">
                          <p className="text-xs font-bold text-slate-400">
                            Gerekli
                          </p>
                          <p className="mt-1 text-lg font-bold text-slate-900">
                            {item.requiredUnits}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-slate-100 p-3">
                          <p className="text-xs font-bold text-slate-400">
                            Hastada Var
                          </p>
                          <p className="mt-1 text-lg font-bold text-slate-900">
                            {item.availableUnits}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-slate-100 p-3">
                          <p className="text-xs font-bold text-slate-400">
                            Eksik
                          </p>
                          <p className="mt-1 text-lg font-bold text-slate-900">
                            {item.missingUnits}
                          </p>
                        </div>
                      </div>

                      {item.matchedMedicine && (
                        <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 font-semibold">
                            <CalendarClock size={14} />
                            Hastadaki SKT:{' '}
                            {formatDate(item.matchedMedicine.expiryDate)}
                          </span>

                          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 font-semibold">
                            Hastada kalan:{' '}
                            {item.matchedMedicine.remainingUnits}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-start gap-2 lg:items-end">
                    <StatusBadge tone={getItemTone(item.stockStatus)}>
                      {getStockLabel(item.stockStatus)}
                    </StatusBadge>

                    <StatusBadge tone={getStatusTone(item.expiryStatus)}>
                      {getExpiryStatusLabel(item.expiryStatus)}
                    </StatusBadge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default DoctorPrescriptionDetailPage;