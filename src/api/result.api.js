import axiosClient from './axiosClient';

export const getMyResultsApi = () => axiosClient.get('/results/my');
export const getAllResultsApi = (params) => axiosClient.get('/results/all', { params });
export const getResultApi = (id) => axiosClient.get(`/results/${id}`);
export const createResultApi = (data) => axiosClient.post('/results', data);
export const updateResultApi = (id, data) => axiosClient.put(`/results/${id}`, data);
export const deleteResultApi = (id) => axiosClient.delete(`/results/${id}`);
export const toggleVisibilityApi = (id) => axiosClient.patch(`/results/${id}/visibility`);
export const regenerateAiApi = (id) => axiosClient.post(`/ai/results/${id}/regenerate`);
export const extractFromImageApi = (image, mediaType) =>
  axiosClient.post('/ai/extract-from-image', { image, mediaType });
export const sendReportEmailApi = (id) => axiosClient.post(`/results/${id}/send-email`);
export const chatWithResultApi = (id, question, history) =>
  axiosClient.post(`/ai/results/${id}/chat`, { question, history });
