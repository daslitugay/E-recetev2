import api from './api';

export const getPatientPrescriptions = async () => {
  const { data } = await api.get('/prescriptions/patient');
  return data;
};

export const getDoctorPrescriptions = async () => {
  const { data } = await api.get('/prescriptions/doctor');
  return data;
};

export const getPrescriptionById = async (prescriptionId) => {
  const { data } = await api.get(`/prescriptions/${prescriptionId}`);
  return data;
};

export const createPrescription = async (payload) => {
  const { data } = await api.post('/prescriptions', payload);
  return data;
};

export const refreshPrescriptionStock = async (prescriptionId) => {
  const { data } = await api.patch(
    `/prescriptions/${prescriptionId}/refresh-stock`
  );
  return data;
};

export const updatePrescriptionStatus = async (prescriptionId, status) => {
  const { data } = await api.patch(`/prescriptions/${prescriptionId}/status`, {
    status,
  });

  return data;
};