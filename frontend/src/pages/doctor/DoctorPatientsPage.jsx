import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  Eye,
  RefreshCw,
  Search,
  Send,
  UserRound,
  Users,
  X,
} from 'lucide-react';

import {
  getDoctorPatients,
  getPatientMedicinesForDoctor,
  searchPatientByCode,
  sendConnectionRequest,
} from '../../api/connectionApi';
import StatusBadge from '../../components/ui/StatusBadge';
import {
  getExpiryStatusLabel,
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

const DoctorPatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedPatientMedicines, setSelectedPatientMedicines] = useState([]);
  const [patientCode, setPatientCode] = useState('');
  const [searchedPatient, setSearchedPatient] = useState(null);
  const [searchMessage, setSearchMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [isLoadingMedicines, setIsLoadingMedicines] = useState(false);
  const [error, setError] = useState('');

  const loadPatients = async () => {
    try {
      setIsLoadingPatients(true);
      setError('');

      const data = await getDoctorPatients();
      setPatients(data.patients || []);
    } catch (err) {
      setError(err.message || 'Hastalar alınamadı.');
    } finally {
      setIsLoadingPatients(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return patients;
    }

    return patients.filter((patient) => {
      const target = `${patient.name} ${patient.email} ${patient.patientCode}`.toLowerCase();
      return target.includes(query);
    });
  }, [patients, searchTerm]);

  const handleSearchPatient = async (event) => {
    event.preventDefault();

    const normalizedCode = patientCode.trim().toUpperCase();

    if (!normalizedCode) {
      setSearchMessage('Hasta kodu girmeniz gerekiyor.');
      setSearchedPatient(null);
      return;
    }

    try {
      setIsSearching(true);
      setSearchMessage('');
      setSearchedPatient(null);

      const data = await searchPatientByCode(normalizedCode);
      setSearchedPatient({
        ...data.patient,
        connectionStatus: data.connectionStatus,
      });
    } catch (err) {
      setSearchMessage(err.message || 'Hasta bulunamadı.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendRequest = async () => {
    if (!searchedPatient?.patientCode) {
      return;
    }

    try {
      setIsSendingRequest(true);
      setSearchMessage('');

      await sendConnectionRequest(searchedPatient.patientCode);

      setSearchedPatient((prev) => ({
        ...prev,
        connectionStatus: 'PENDING',
      }));

      setSearchMessage('Bağlantı isteği gönderildi.');
    } catch (err) {
      setSearchMessage(err.message || 'Bağlantı isteği gönderilemedi.');
    } finally {
      setIsSendingRequest(false);
    }
  };

  const handleViewMedicines = async (patient) => {
    try {
      setSelectedPatient(patient);
      setSelectedPatientMedicines([]);
      setIsLoadingMedicines(true);
      setError('');

      const data = await getPatientMedicinesForDoctor(patient._id);
      setSelectedPatientMedicines(data.medicines || []);
    } catch (err) {
      setError(err.message || 'Hasta ilaçları alınamadı.');
    } finally {
      setIsLoadingMedicines(false);
    }
  };

  const handleCloseMedicines = () => {
    setSelectedPatient(null);
    setSelectedPatientMedicines([]);
  };

  const renderConnectionAction = () => {
    if (!searchedPatient) {
      return null;
    }

    if (searchedPatient.connectionStatus === 'ACCEPTED') {
      return (
        <StatusBadge tone="green">
          Bu hasta ile bağlantınız zaten onaylı
        </StatusBadge>
      );
    }

    if (searchedPatient.connectionStatus === 'PENDING') {
      return (
        <StatusBadge tone="amber">
          Bu hastaya gönderilen istek onay bekliyor
        </StatusBadge>
      );
    }

    return (
      <button
        type="button"
        onClick={handleSendRequest}
        disabled={isSendingRequest}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
      >
        <Send size={17} />
        {isSendingRequest ? 'Gönderiliyor...' : 'Bağlantı İsteği Gönder'}
      </button>
    );
  };

  if (isLoadingPatients) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-500">
        Hastalar yükleniyor...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-semibold text-blue-600">Doktor Paneli</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">
              Hastalarım
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Hasta koduyla bağlantı isteği gönderin ve onaylı hastalarınızın
              ilaç dolaplarını görüntüleyin.
            </p>
          </div>

          <button
            type="button"
            onClick={loadPatients}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw size={17} />
            Yenile
          </button>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-1">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Search size={21} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">Hasta Ara</h2>
              <p className="text-sm text-slate-500">PAT kodu ile arayın.</p>
            </div>
          </div>

          <form onSubmit={handleSearchPatient} className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Hasta Kodu
              </label>
              <input
                value={patientCode}
                onChange={(event) => setPatientCode(event.target.value)}
                placeholder="PAT-ABC123"
                className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm uppercase outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <button
              type="submit"
              disabled={isSearching}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700"
            >
              {isSearching ? 'Aranıyor...' : 'Hastayı Ara'}
            </button>
          </form>

          {searchMessage && (
            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm font-semibold text-slate-600">
              {searchMessage}
            </div>
          )}

          {searchedPatient && (
            <div className="mt-5 rounded-2xl border border-slate-200 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <UserRound size={20} />
                </div>

                <div>
                  <p className="font-bold text-slate-900">
                    {searchedPatient.name}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {searchedPatient.email}
                  </p>
                  <p className="mt-1 text-xs font-bold text-blue-600">
                    {searchedPatient.patientCode}
                  </p>
                </div>
              </div>

              <div className="mt-4">{renderConnectionAction()}</div>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Bağlı Hastalar
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Toplam {filteredPatients.length} hasta gösteriliyor.
              </p>
            </div>

            <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50">
              <Search size={18} className="text-slate-400" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Hasta ara..."
                className="w-full min-w-[220px] border-0 bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          {filteredPatients.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {filteredPatients.map((patient) => (
                <div
                  key={patient._id}
                  className="flex flex-col justify-between gap-4 p-5 lg:flex-row lg:items-center"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                      <UserRound size={21} />
                    </div>

                    <div>
                      <p className="font-bold text-slate-900">
                        {patient.name}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {patient.email}
                      </p>
                      <p className="mt-1 text-xs font-bold text-blue-600">
                        {patient.patientCode}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleViewMedicines(patient)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-100 px-4 py-2.5 text-sm font-bold text-blue-600 hover:bg-blue-50"
                  >
                    <Eye size={17} />
                    İlaçlarını Gör
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Users size={24} />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">
                Bağlı hasta bulunmuyor
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Hasta kodu ile arama yapıp bağlantı isteği gönderebilirsiniz.
              </p>
            </div>
          )}
        </div>
      </section>

      {selectedPatient && (
        <section className="rounded-3xl border border-blue-100 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-semibold text-blue-600">
                Hasta İlaç Dolabı
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">
                {selectedPatient.name}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {selectedPatient.patientCode} • {selectedPatient.email}
              </p>
            </div>

            <button
              type="button"
              onClick={handleCloseMedicines}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
            >
              <X size={17} />
              Kapat
            </button>
          </div>

          {isLoadingMedicines ? (
            <div className="p-8 text-center text-sm text-slate-500">
              İlaçlar yükleniyor...
            </div>
          ) : selectedPatientMedicines.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">İlaç</th>
                    <th className="px-5 py-3">Form</th>
                    <th className="px-5 py-3">Stok</th>
                    <th className="px-5 py-3">Stok Durumu</th>
                    <th className="px-5 py-3">SKT</th>
                    <th className="px-5 py-3">SKT Durumu</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {selectedPatientMedicines.map((medicine) => (
                    <tr key={medicine._id}>
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-900">
                          {medicine.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {medicine.dosage || 'Doz belirtilmemiş'}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {medicine.form}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        <span className="font-bold text-slate-900">
                          {medicine.remainingUnits}
                        </span>{' '}
                        / {medicine.totalUnits}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge tone={getStatusTone(medicine.stockStatus)}>
                          {getStockStatusLabel(medicine.stockStatus)}
                        </StatusBadge>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        <div className="flex items-center gap-2">
                          <CalendarDays size={16} className="text-slate-400" />
                          {formatDate(medicine.expiryDate)}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge
                          tone={getStatusTone(medicine.expiryStatus)}
                        >
                          {getExpiryStatusLabel(medicine.expiryStatus)}
                        </StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-slate-500">
              Bu hastanın kayıtlı ilacı bulunmuyor.
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default DoctorPatientsPage;