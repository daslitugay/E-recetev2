import api from './api';

export const getAdminUsers = async () => {
  const { data } = await api.get('/admin/users');
  return data;
};

export const getPendingDoctors = async () => {
  const { data } = await api.get('/admin/doctors/pending');
  return data;
};

export const approveDoctor = async (doctorId) => {
  const { data } = await api.patch(`/admin/doctors/${doctorId}/approve`);
  return data;
};

export const rejectDoctor = async (doctorId) => {
  const { data } = await api.patch(`/admin/doctors/${doctorId}/reject`);
  return data;
};