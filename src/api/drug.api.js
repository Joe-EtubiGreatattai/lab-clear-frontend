import axiosClient from './axiosClient';

/**
 * Verify a drug by its NAFDAC Registration Number (NRN).
 * @param {string} nrn - The NRN to look up (e.g. "A4-1234")
 * @param {object} location - Optional geolocation { lat, lng, city, state }
 */
export const verifyDrugApi = (nrn, location = {}) =>
  axiosClient.get(`/drugs/verify/${encodeURIComponent(nrn.trim())}`, {
    data: { userLocation: location },
  });

/**
 * Submit a suspected-fake report for an NRN.
 * @param {string} nrn
 * @param {string} userNote - Optional description of the concern
 * @param {object} location - Optional geolocation { lat, lng, city, state }
 */
export const reportDrugApi = (nrn, userNote = '', location = {}) =>
  axiosClient.post('/drugs/report', {
    nrn: nrn.trim(),
    reportType: 'suspected_fake',
    userNote,
    userLocation: location,
  });

/**
 * Fetch heatmap data — all suspected-fake reports with NRN + location + date.
 */
export const getHeatmapDataApi = () => axiosClient.get('/drugs/reports/heatmap');

/**
 * Search drugs by name/NRN for typeahead suggestions.
 * @param {string} q - Search query (min 2 chars)
 */
export const searchDrugsApi = (q) =>
  axiosClient.get('/drugs/search', { params: { q } });
