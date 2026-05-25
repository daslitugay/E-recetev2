import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ClipboardPlus,
  Plus,
  RefreshCw,
  Save,
  Trash2,
} from 'lucide-react';

import { getDoctorPatients } from '../../api/connectionApi';
import { getMedicineForms } from '../../api/metaApi';
import { createPrescription } from '../../api/prescriptionApi';

const createEmptyItem = () => ({
  medicineName: '',
  dosage: '',
  form: 'TABLET',
  frequencyPerDay: 1,
  durationDays: 1,
  unitsPerDose: 1,
  usageInstruction: '',
});

const DoctorCreatePrescriptionPage = () => {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [forms, setForms] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [diagnosisNote, setDiagnosisNote] = useState('');
  const [generalNote, setGeneralNote] = useState('');
  const [items, setItems] = useState([createEmptyItem()]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const selectedPatient = useMemo(() => {
    return patients.find((patient) => patient._id === selectedPatientId);
  }, [patients, selectedPatientId]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      setError('');
      setSuccessMessage('');

      const [patientsResponse, formsResponse] = await Promise.all([
        getDoctorPatients(),
        getMedicineForms(),
      ]);

      const loadedPatients = patientsResponse.patients || [];

      setPatients(loadedPatients);
      setForms(formsResponse.forms || []);

      if (loadedPatients.length > 0 && !selectedPatientId) {
        setSelectedPatientId(loadedPatients[0]._id);
      }
    } catch (err) {
      setError(err.message || 'Reçete oluşturma verileri alınamadı.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleItemChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );

    if (error) {
      setError('');
    }
  };

  const handleAddItem = () => {
    setItems((prev) => [...prev, createEmptyItem()]);
  };

  const handleRemoveItem = (index) => {
    setItems((prev) => {
      if (prev.length === 1) {
        return prev;
      }

      return prev.filter((_, itemIndex) => itemIndex !== index);
    });
  };

  const getRequiredUnits = (item) => {
    const frequency = Number(item.frequencyPerDay) || 0;
    const duration = Number(item.durationDays) || 0;
    const units = Number(item.unitsPerDose) || 0;

    return frequency * duration * units;
  };

  const validateForm = () => {
    if (!selectedPatientId) {
      return 'Lütfen reçete yazılacak hastayı seçin.';
    }

    if (items.length === 0) {
      return 'Reçeteye en az bir ilaç eklenmelidir.';
    }

    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];

      if (!item.medicineName.trim()) {
        return `${index + 1}. ilaç için ilaç adı zorunludur.`;
      }

      if (!item.form) {
        return `${index + 1}. ilaç için form seçimi zorunludur.`;
      }

      if (Number(item.frequencyPerDay) < 1) {
        return `${index + 1}. ilaç için günlük kullanım en az 1 olmalıdır.`;
      }

      if (Number(item.durationDays) < 1) {
        return `${index + 1}. ilaç için süre en az 1 gün olmalıdır.`;
      }

      if (Number(item.unitsPerDose) < 1) {
        return `${index + 1}. ilaç için doz başı adet en az 1 olmalıdır.`;
      }
    }

    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setSuccessMessage('');

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = {
      patientId: selectedPatientId,
      diagnosisNote,
      generalNote,
      items: items.map((item) => ({
        medicineName: item.medicineName.trim(),
        dosage: item.dosage.trim(),
        form: item.form,
        frequencyPerDay: Number(item.frequencyPerDay),
        durationDays: Number(item.durationDays),
        unitsPerDose: Number(item.unitsPerDose),
        usageInstruction: item.usageInstruction.trim(),
      })),
    };

    try {
      setIsSaving(true);

      const data = await createPrescription(payload);

      setSuccessMessage('Reçete başarıyla oluşturuldu.');

      setTimeout(() => {
        navigate(`/doctor/prescriptions/${data.prescription._id}`);
      }, 700);
    } catch (err) {
      setError(err.message || 'Reçete oluşturulamadı.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-500">
        Reçete oluşturma ekranı yükleniyor...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center">
        <div>
          <Link
            to="/doctor/dashboard"
            className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-blue-600"
          >
            <ArrowLeft size={17} />
            Dashboard’a Dön
          </Link>

          <p className="text-sm font-semibold text-blue-600">Doktor Paneli</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            Reçete Oluştur
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Bağlı hastalarınız için reçete oluşturun. Sistem, reçetedeki
            ilaçları hastanın dijital ilaç dolabıyla karşılaştırır.
          </p>
        </div>

        <button
          type="button"
          onClick={loadInitialData}
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

      {successMessage && (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          {successMessage}
        </div>
      )}

      {patients.length === 0 ? (
        <section className="rounded-3xl border border-amber-100 bg-amber-50 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-amber-600">
            <ClipboardPlus size={24} />
          </div>

          <h2 className="mt-4 text-xl font-bold text-slate-900">
            Reçete oluşturmak için bağlı hasta gerekli
          </h2>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
            Önce hastanın size bağlantı onayı vermesi gerekir. Hasta kodu ile
            bağlantı isteği gönderebilirsiniz.
          </p>

          <Link
            to="/doctor/patients"
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
          >
            Hastalarım Ekranına Git
          </Link>
        </section>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-5 lg:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Hasta
                </label>

                <select
                  value={selectedPatientId}
                  onChange={(event) => setSelectedPatientId(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                >
                  {patients.map((patient) => (
                    <option key={patient._id} value={patient._id}>
                      {patient.name} • {patient.patientCode}
                    </option>
                  ))}
                </select>

                {selectedPatient && (
                  <p className="mt-2 text-xs font-semibold text-slate-500">
                    {selectedPatient.email}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Genel Not
                </label>

                <input
                  value={generalNote}
                  onChange={(event) => setGeneralNote(event.target.value)}
                  placeholder="Örn. İlaçlar düzenli kullanılmalıdır."
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Tanı / Açıklama Notu
                </label>

                <textarea
                  value={diagnosisNote}
                  onChange={(event) => setDiagnosisNote(event.target.value)}
                  rows="3"
                  placeholder="Örn. Kontrol amaçlı reçete."
                  className="w-full resize-none rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Reçetedeki İlaçlar
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  İlaç adı, doz ve form bilgisi hastanın ilaç dolabıyla
                  eşleşmede kullanılır.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-100 px-4 py-2.5 text-sm font-bold text-blue-600 hover:bg-blue-50"
              >
                <Plus size={17} />
                İlaç Satırı Ekle
              </button>
            </div>

            <div className="space-y-5 p-5">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="rounded-3xl border border-slate-200 bg-slate-50/60 p-5"
                >
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-slate-900">
                        {index + 1}. İlaç
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        Gerekli toplam adet:{' '}
                        <span className="font-bold text-blue-600">
                          {getRequiredUnits(item)}
                        </span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      disabled={items.length === 1}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-100 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-40"
                    >
                      <Trash2 size={15} />
                      Kaldır
                    </button>
                  </div>

                  <div className="grid gap-5 lg:grid-cols-3">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        İlaç Adı
                      </label>

                      <input
                        value={item.medicineName}
                        onChange={(event) =>
                          handleItemChange(
                            index,
                            'medicineName',
                            event.target.value
                          )
                        }
                        placeholder="Örn. Parol"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Doz
                      </label>

                      <input
                        value={item.dosage}
                        onChange={(event) =>
                          handleItemChange(index, 'dosage', event.target.value)
                        }
                        placeholder="Örn. 500 mg"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Form
                      </label>

                      <select
                        value={item.form}
                        onChange={(event) =>
                          handleItemChange(index, 'form', event.target.value)
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                      >
                        {forms.map((form) => (
                          <option key={form.value} value={form.value}>
                            {form.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Günde Kaç Kez
                      </label>

                      <input
                        type="number"
                        min="1"
                        value={item.frequencyPerDay}
                        onChange={(event) =>
                          handleItemChange(
                            index,
                            'frequencyPerDay',
                            event.target.value
                          )
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Kaç Gün
                      </label>

                      <input
                        type="number"
                        min="1"
                        value={item.durationDays}
                        onChange={(event) =>
                          handleItemChange(
                            index,
                            'durationDays',
                            event.target.value
                          )
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Doz Başı Adet
                      </label>

                      <input
                        type="number"
                        min="1"
                        value={item.unitsPerDose}
                        onChange={(event) =>
                          handleItemChange(
                            index,
                            'unitsPerDose',
                            event.target.value
                          )
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                      />
                    </div>

                    <div className="lg:col-span-3">
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Kullanım Talimatı
                      </label>

                      <textarea
                        value={item.usageInstruction}
                        onChange={(event) =>
                          handleItemChange(
                            index,
                            'usageInstruction',
                            event.target.value
                          )
                        }
                        rows="2"
                        placeholder="Örn. Sabah ve akşam tok karnına alın."
                        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="flex flex-col justify-end gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row">
            <Link
              to="/doctor/dashboard"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
            >
              Vazgeç
            </Link>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
            >
              <Save size={17} />
              {isSaving ? 'Reçete oluşturuluyor...' : 'Reçeteyi Oluştur'}
            </button>
          </section>
        </form>
      )}
    </div>
  );
};

export default DoctorCreatePrescriptionPage;