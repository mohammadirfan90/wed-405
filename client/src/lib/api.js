import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRedirecting = false;
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    const url = err?.config?.url || '';
    // Don't bounce users during the login or refresh flows
    const isAuthCall = /\/auth\/(login|register|forgot|reset)/.test(url);
    if (status === 401 && !isAuthCall && !isRedirecting && typeof window !== 'undefined') {
      isRedirecting = true;
      localStorage.removeItem('cm_token');
      localStorage.removeItem('cm_user');
      const here = window.location.pathname + window.location.search;
      if (!here.startsWith('/login') && !here.startsWith('/register')) {
        window.location.replace('/login?from=' + encodeURIComponent(here));
      }
      setTimeout(() => { isRedirecting = false; }, 1500);
    }
    return Promise.reject(err);
  }
);

export default api;
