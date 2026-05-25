import { useEffect, useState } from 'react';
import {
  Check,
  Mail,
  RefreshCw,
  ShieldCheck,
  Stethoscope,
  X,
} from 'lucide-react';

import {
  approveDoctor,
  getPendingDoctors,
  rejectDoctor,
} from '../../api/adminApi';
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

const AdminDoctorsPage = () => {
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadPendingDoctors = async () => {
    try {
      setIsLoading(true);
      setError('');
      setMessage('');

      const data = await getPendingDoctors();
      setPendingDoctors(data.doctors || []);
    } catch (err) {
      setError(err.message || 'Bekleyen doktorlar alınamadı.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPendingDoctors();
  }, []);

  const handleApprove = async (doctor) => {
    try {
      setProcessingId(doctor._id);
      setError('');
      setMessage('');

      await approveDoctor(doctor._id);

      setPendingDoctors((prev) =>
        prev.filter((item) => item._id !== doctor._id)
      );

      setMessage(`${doctor.name} onaylandı.`);
    } catch (err) {
      setError(err.message || 'Doktor onaylanamadı.');
    } finally {
      setProcessingId('');
    }
  };

  const handleReject = async (doctor) => {
    const confirmed = window.confirm(
      `${doctor.name} adlı doktor hesabını reddetmek istediğine emin misin?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(doctor._id);
      setError('');
      setMessage('');

      await rejectDoctor(doctor._id);

      setPendingDoctors((prev) =>
        prev.filter((item) => item._id !== doctor._id)
      );

      setMessage(`${doctor.name} reddedildi.`);
    } catch (err) {
      setError(err.message || 'Doktor reddedilemedi.');
    } finally {
      setProcessingId('');
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-500">
        Doktor onayları yükleniyor...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center">
        <div>
          <p className="text-sm font-semibold text-blue-600">Admin Paneli</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            Doktor Onayları
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Doktor olarak kayıt olan kullanıcıları inceleyip onaylayın veya
            reddedin.
          </p>
        </div>

        <button
          type="button"
          onClick={loadPendingDoctors}
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

      {message && (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          {message}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">
            Bekleyen Doktor
          </p>
          <p className="mt-2 text-3xl font-bold text-amber-600">
            {pendingDoctors.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-2">
          <p className="text-sm font-semibold text-slate-500">
            Onay Mantığı
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Doktor hesapları kayıt olduktan sonra sistemde işlem yapamaz. Admin
            onayı verildiğinde hasta arama, bağlantı isteği ve reçete oluşturma
            özellikleri açılır.
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-lg font-bold text-slate-900">
            Bekleyen Başvurular
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Onay bekleyen doktor hesapları.
          </p>
        </div>

        {pendingDoctors.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {pendingDoctors.map((doctor) => (
              <div
                key={doctor._id}
                className="flex flex-col justify-between gap-5 p-5 lg:flex-row lg:items-center"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <Stethoscope size={23} />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-slate-900">
                        Dr. {doctor.name}
                      </p>

                      <StatusBadge tone="amber">Onay bekliyor</StatusBadge>
                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                      {doctor.specialization || 'Uzmanlık belirtilmemiş'}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 font-semibold">
                        <Mail size={14} />
                        {doctor.email}
                      </span>

                      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 font-semibold">
                        Kayıt tarihi: {formatDate(doctor.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    disabled={processingId === doctor._id}
                    onClick={() => handleApprove(doctor)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"
                  >
                    <Check size={17} />
                    {processingId === doctor._id ? 'İşleniyor...' : 'Onayla'}
                  </button>

                  <button
                    type="button"
                    disabled={processingId === doctor._id}
                    onClick={() => handleReject(doctor)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-100 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50"
                  >
                    <X size={17} />
                    Reddet
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <ShieldCheck size={24} />
            </div>

            <h3 className="mt-4 text-lg font-bold text-slate-900">
              Bekleyen doktor başvurusu yok
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Yeni doktor kayıtları burada görünecek.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminDoctorsPage;