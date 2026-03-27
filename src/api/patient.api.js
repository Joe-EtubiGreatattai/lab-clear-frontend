import axiosClient from './axiosClient';

export const getPatientsApi = (search = '') =>
  axiosClient.get('/patients', { params: { search } });

export const createPatientApi = (data) => axiosClient.post('/patients', data);
export const getPatientApi = (id) => axiosClient.get(`/patients/${id}`);
export const updatePatientApi = (id, data) => axiosClient.put(`/patients/${id}`, data);
export const deletePatientApi = (id) => axiosClient.delete(`/patients/${id}`);
export const getPatientResultsApi = (patientId) =>
  axiosClient.get(`/patients/${patientId}/results`);
