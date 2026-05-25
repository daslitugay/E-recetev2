import { useEffect, useState } from 'react';
import {
  Check,
  Mail,
  RefreshCw,
  Stethoscope,
  UserRoundCheck,
  X,
} from 'lucide-react';

import {
  getMyDoctors,
  getPatientConnectionRequests,
  respondConnectionRequest,
} from '../../api/connectionApi';
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

const PatientDoctorsPage = () => {
  const [requests, setRequests] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [respondingId, setRespondingId] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError('');
      setMessage('');

      const [requestsResponse, doctorsResponse] = await Promise.all([
        getPatientConnectionRequests(),
        getMyDoctors(),
      ]);

      setRequests(requestsResponse.requests || []);
      setDoctors(doctorsResponse.doctors || []);
    } catch (err) {
      setError(err.message || 'Doktor bilgileri alınamadı.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRespond = async (requestId, status) => {
    try {
      setRespondingId(requestId);
      setError('');
      setMessage('');

      await respondConnectionRequest(requestId, status);

      setMessage(
        status === 'ACCEPTED'
          ? 'Doktor bağlantı isteği kabul edildi.'
          : 'Doktor bağlantı isteği reddedildi.'
      );

      await loadData();
    } catch (err) {
      setError(err.message || 'İstek yanıtlanamadı.');
    } finally {
      setRespondingId('');
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-500">
        Doktor bilgileri yükleniyor...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center">
        <div>
          <p className="text-sm font-semibold text-blue-600">Hasta Paneli</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            Doktorlarım
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Size gelen doktor bağlantı isteklerini yönetin ve bağlı
            doktorlarınızı görüntüleyin.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
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
          <p className="text-sm font-semibold text-slate-500">Bekleyen İstek</p>
          <p className="mt-2 text-3xl font-bold text-amber-600">
            {requests.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Bağlı Doktor</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {doctors.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Erişim Durumu</p>
          <p className="mt-2 text-lg font-bold text-slate-900">
            Hasta onayı zorunlu
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Doktorlar sadece sizin onayladığınız verileri görebilir.
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-lg font-bold text-slate-900">
            Gelen Bağlantı İstekleri
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Doktorlardan gelen erişim isteklerini kabul veya reddedin.
          </p>
        </div>

        {requests.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {requests.map((request) => (
              <div
                key={request._id}
                className="flex flex-col justify-between gap-4 p-5 lg:flex-row lg:items-center"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <Stethoscope size={23} />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-slate-900">
                        Dr. {request.doctor?.name || '-'}
                      </p>

                      <StatusBadge tone="amber">Onay bekliyor</StatusBadge>
                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                      {request.doctor?.specialization || 'Uzmanlık belirtilmemiş'}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 font-semibold">
                        <Mail size={14} />
                        {request.doctor?.email || '-'}
                      </span>

                      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 font-semibold">
                        İstek tarihi: {formatDate(request.requestedAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    disabled={respondingId === request._id}
                    onClick={() => handleRespond(request._id, 'ACCEPTED')}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"
                  >
                    <Check size={17} />
                    {respondingId === request._id ? 'İşleniyor...' : 'Kabul Et'}
                  </button>

                  <button
                    type="button"
                    disabled={respondingId === request._id}
                    onClick={() => handleRespond(request._id, 'REJECTED')}
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
              <UserRoundCheck size={24} />
            </div>

            <h3 className="mt-4 text-lg font-bold text-slate-900">
              Bekleyen istek yok
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Doktor bağlantı isteği gönderdiğinde burada görünecek.
            </p>
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-lg font-bold text-slate-900">
            Bağlı Doktorlar
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Onay verdiğiniz doktorlar burada listelenir.
          </p>
        </div>

        {doctors.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {doctors.map((doctor) => (
              <div
                key={doctor._id}
                className="flex flex-col justify-between gap-4 p-5 lg:flex-row lg:items-center"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <Stethoscope size={23} />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-slate-900">
                        Dr. {doctor.name || '-'}
                      </p>

                      <StatusBadge tone="green">Bağlı</StatusBadge>
                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                      {doctor.specialization || 'Uzmanlık belirtilmemiş'}
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
                      {doctor.email || '-'}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-500">
                  İlaç dolabınıza erişebilir
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Stethoscope size={24} />
            </div>

            <h3 className="mt-4 text-lg font-bold text-slate-900">
              Bağlı doktor yok
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Bir doktor bağlantı isteği gönderip siz kabul ettiğinizde burada
              listelenir.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default PatientDoctorsPage;