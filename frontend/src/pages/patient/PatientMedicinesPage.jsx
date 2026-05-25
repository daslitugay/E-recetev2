import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  Edit,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from 'lucide-react';

import {
  createMedicine,
  deleteMedicine,
  getMyMedicines,
  updateMedicine,
} from '../../api/medicineApi';
import { getMedicineForms } from '../../api/metaApi';
import StatusBadge from '../../components/ui/StatusBadge';
import {
  getExpiryStatusLabel,
  getStatusTone,
  getStockStatusLabel,
} from '../../utils/statusLabels';

const initialFormState = {
  name: '',
  dosage: '',
  form: 'TABLET',
  boxCount: 1,
  unitsPerBox: 1,
  remainingUnits: '',
  expiryDate: '',
  notes: '',
};

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

const formatDateForInput = (date) => {
  if (!date) {
    return '';
  }

  return new Date(date).toISOString().split('T')[0];
};

const PatientMedicinesPage = () => {
  const [medicines, setMedicines] = useState([]);
  const [forms, setForms] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const [medicineResponse, formsResponse] = await Promise.all([
        getMyMedicines(),
        getMedicineForms(),
      ]);

      setMedicines(medicineResponse.medicines || []);
      setForms(formsResponse.forms || []);
    } catch (err) {
      setError(err.message || 'İlaçlar alınamadı.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredMedicines = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return medicines;
    }

    return medicines.filter((medicine) => {
      const target = `${medicine.name} ${medicine.dosage} ${medicine.form} ${medicine.notes || ''}`.toLowerCase();
      return target.includes(query);
    });
  }, [medicines, searchTerm]);

  const resetForm = () => {
    setFormData(initialFormState);
    setFormError('');
    setEditingMedicine(null);
    };

  const handleOpenCreateForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (medicine) => {
    setEditingMedicine(medicine);
    setFormError('');

    setFormData({
      name: medicine.name || '',
      dosage: medicine.dosage || '',
      form: medicine.form || 'TABLET',
      boxCount: medicine.boxCount ?? 1,
      unitsPerBox: medicine.unitsPerBox ?? 1,
      remainingUnits: medicine.remainingUnits ?? '',
      expiryDate: formatDateForInput(medicine.expiryDate),
      notes: medicine.notes || '',
    });

    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    resetForm();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (formError) {
      setFormError('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('İlaç adı zorunludur.');
      return;
    }

    if (!formData.expiryDate) {
      setFormError('Son kullanma tarihi zorunludur.');
      return;
    }

    if (Number(formData.boxCount) < 0) {
      setFormError('Kutu sayısı negatif olamaz.');
      return;
    }

    if (Number(formData.unitsPerBox) < 1) {
      setFormError('Kutu içi adet en az 1 olmalıdır.');
      return;
    }

    const payload = {
      name: formData.name,
      dosage: formData.dosage,
      form: formData.form,
      boxCount: Number(formData.boxCount),
      unitsPerBox: Number(formData.unitsPerBox),
      expiryDate: formData.expiryDate,
      notes: formData.notes,
    };

    if (formData.remainingUnits !== '') {
      payload.remainingUnits = Number(formData.remainingUnits);
    }

    try {
      setIsSaving(true);

      if (editingMedicine) {
        await updateMedicine(editingMedicine._id, payload);
      } else {
        await createMedicine(payload);
      }

      await loadData();

      handleCloseForm();
    } catch (err) {
      setFormError(err.message || 'İlaç kaydedilemedi.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (medicine) => {
    const confirmed = window.confirm(
      `${medicine.name} ilacını silmek istediğine emin misin?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(medicine._id);
      await deleteMedicine(medicine._id);
      setMedicines((prev) => prev.filter((item) => item._id !== medicine._id));
    } catch (err) {
      setError(err.message || 'İlaç silinemedi.');
    } finally {
      setDeletingId('');
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-500">
        İlaçlar yükleniyor...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center">
        <div>
          <p className="text-sm font-semibold text-blue-600">Hasta Paneli</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">İlaçlarım</h1>
          <p className="mt-2 text-sm text-slate-500">
            Evde bulunan ilaçlarınızı, stok durumunu ve son kullanma tarihlerini takip edin.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw size={17} />
            Yenile
          </button>

          <button
            type="button"
            onClick={handleOpenCreateForm}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
          >
            <Plus size={17} />
            İlaç Ekle
          </button>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {isFormOpen && (
        <section className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
                <h2 className="text-lg font-bold text-slate-900">
                    {editingMedicine ? 'İlaç Düzenle' : 'Yeni İlaç Ekle'}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                    {editingMedicine
                        ? 'İlaç bilgilerini güncelleyin. Kutu ve adet bilgileri toplam stok hesabını etkiler.'
                        : 'Kutu ve adet bilgileri toplam stok hesabı için kullanılır.'}
                </p>
            </div>

            <button
              type="button"
              onClick={handleCloseForm}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={20} />
            </button>
          </div>

          {formError && (
            <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                İlaç Adı
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Örn. Parol"
                className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Doz
              </label>
              <input
                name="dosage"
                value={formData.dosage}
                onChange={handleChange}
                placeholder="Örn. 500 mg"
                className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Form
              </label>
              <select
                name="form"
                value={formData.form}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              >
                {forms.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Son Kullanma Tarihi
              </label>
              <input
                name="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Kutu Sayısı
              </label>
              <input
                name="boxCount"
                type="number"
                min="0"
                value={formData.boxCount}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Kutu İçi Adet
              </label>
              <input
                name="unitsPerBox"
                type="number"
                min="1"
                value={formData.unitsPerBox}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Kalan Adet
              </label>
              <input
                name="remainingUnits"
                type="number"
                min="0"
                value={formData.remainingUnits}
                onChange={handleChange}
                placeholder="Boş kalırsa toplam adet alınır"
                className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Toplam Adet
              </label>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold text-slate-700">
                {Number(formData.boxCount || 0) * Number(formData.unitsPerBox || 0)}
              </div>
            </div>

            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Not
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                placeholder="İsteğe bağlı not"
                className="w-full resize-none rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <div className="flex justify-end gap-3 lg:col-span-2">
              <button
                type="button"
                onClick={handleCloseForm}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
              >
                Vazgeç
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
              >
                {isSaving
                    ? 'Kaydediliyor...'
                    : editingMedicine
                        ? 'Güncelle'
                        : 'Kaydet'}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900">İlaç Listesi</h2>
            <p className="mt-1 text-sm text-slate-500">
              Toplam {filteredMedicines.length} kayıt gösteriliyor.
            </p>
          </div>

          <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50">
            <Search size={18} className="text-slate-400" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="İlaç ara..."
              className="w-full min-w-[220px] border-0 bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        {filteredMedicines.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">İlaç</th>
                  <th className="px-5 py-3">Form</th>
                  <th className="px-5 py-3">Stok</th>
                  <th className="px-5 py-3">Stok Durumu</th>
                  <th className="px-5 py-3">SKT</th>
                  <th className="px-5 py-3">SKT Durumu</th>
                  <th className="px-5 py-3 text-right">İşlem</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredMedicines.map((medicine) => (
                  <tr key={medicine._id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900">
                        {medicine.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {medicine.dosage || 'Doz belirtilmemiş'}
                      </p>
                      {medicine.notes && (
                        <p className="mt-1 max-w-xs truncate text-xs text-slate-400">
                          {medicine.notes}
                        </p>
                      )}
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
                      <StatusBadge tone={getStatusTone(medicine.expiryStatus)}>
                        {getExpiryStatusLabel(medicine.expiryStatus)}
                      </StatusBadge>
                    </td>

                    <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => handleOpenEditForm(medicine)}
                                className="inline-flex items-center gap-2 rounded-xl border border-blue-100 px-3 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50"
                            >
                                <Edit size={15} />
                                Düzenle
                            </button>

                            <button
                                type="button"
                                disabled={deletingId === medicine._id}
                                onClick={() => handleDelete(medicine)}
                                className="inline-flex items-center gap-2 rounded-xl border border-red-100 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
                            >
                                <Trash2 size={15} />
                                {deletingId === medicine._id ? 'Siliniyor' : 'Sil'}
                            </button>
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Plus size={24} />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">
              Henüz ilaç kaydı yok
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              İlk ilacınızı ekleyerek dijital ilaç dolabınızı oluşturmaya başlayın.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default PatientMedicinesPage;