import api from './api';

export const getMedicineForms = async () => {
  const { data } = await api.get('/meta/medicine-forms');
  return data;
};