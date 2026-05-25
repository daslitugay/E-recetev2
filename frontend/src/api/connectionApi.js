import api from './api';

export const searchPatientByCode = async (patientCode) => {
  const { data } = await api.get('/connections/doctor/search-patient', {
    params: { patientCode },
  });

  return data;
};

export const sendConnectionRequest = async (patientCode) => {
  const { data } = await api.post('/connections/doctor/request', {
    patientCode,
  });

  return data;
};

export const getDoctorPatients = async () => {
  const { data } = await api.get('/connections/doctor/patients');
  return data;
};

export const getPatientMedicinesForDoctor = async (patientId) => {
  const { data } = await api.get(
    `/connections/doctor/patients/${patientId}/medicines`
  );

  return data;
};

export const getPatientConnectionRequests = async () => {
  const { data } = await api.get('/connections/patient/requests');
  return data;
};

export const respondConnectionRequest = async (requestId, status) => {
  const { data } = await api.patch(
    `/connections/patient/requests/${requestId}/respond`,
    { status }
  );

  return data;
};

export const getMyDoctors = async () => {
  const { data } = await api.get('/connections/patient/doctors');
  return data;
};