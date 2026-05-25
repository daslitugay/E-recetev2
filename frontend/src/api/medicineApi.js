import api from './api';

export const getMyMedicines = async () => {
  const { data } = await api.get('/medicines');
  return data;
};

export const getMedicineStats = async () => {
  const { data } = await api.get('/medicines/stats');
  return data;
};

export const createMedicine = async (payload) => {
  const { data } = await api.post('/medicines', payload);
  return data;
};

export const updateMedicine = async (medicineId, payload) => {
  const { data } = await api.put(`/medicines/${medicineId}`, payload);
  return data;
};

export const deleteMedicine = async (medicineId) => {
  const { data } = await api.delete(`/medicines/${medicineId}`);
  return data;
};