import axios from 'axios';

const BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const axiosClient = axios.create({ baseURL: BASE, withCredentials: true });

// Attach access token to every request
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Silent refresh logic — one in-flight refresh at a time
let refreshPromise = null;

axiosClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // Only retry once and only for 401s that aren't the refresh endpoint itself
    if (error.response?.status === 401 && !original._retry && !original.url?.includes('/auth/refresh')) {
      original._retry = true;

      if (!refreshPromise) {
        refreshPromise = axios
          .post(`${BASE}/auth/refresh`, {}, { withCredentials: true })
          .then((r) => {
            localStorage.setItem('token', r.data.token);
            return r.data.token;
          })
          .catch(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return null;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const newToken = await refreshPromise;
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return axiosClient(original);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
