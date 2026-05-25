import api from './api';

export const getPatientDashboard = async () => {
  const { data } = await api.get('/dashboard/patient');
  return data;
};

export const getDoctorDashboard = async () => {
  const { data } = await api.get('/dashboard/doctor');
  return data;
};

export const getAdminDashboard = async () => {
  const { data } = await api.get('/dashboard/admin');
  return data;
};