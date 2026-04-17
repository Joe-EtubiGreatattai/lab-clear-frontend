import axiosClient from './axiosClient';

export const getPatientsApi = (params = {}) =>
  axiosClient.get('/patients', { params });

export const createPatientApi = (data) => axiosClient.post('/patients', data);
export const getPatientApi = (id) => axiosClient.get(`/patients/${id}`);
export const updatePatientApi = (id, data) => axiosClient.put(`/patients/${id}`, data);
export const addDiagnosisApi = (id, data) => axiosClient.post(`/patients/${id}/diagnosis`, data);
export const updateAiRulesApi = (id, aiRules) => axiosClient.patch(`/patients/${id}/rules`, { aiRules });
export const deletePatientApi = (id) => axiosClient.delete(`/patients/${id}`);
export const getPatientResultsApi = (patientId) =>
  axiosClient.get(`/patients/${patientId}/results`);
