import axios from 'axios';
import toast from 'react-hot-toast';
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1', withCredentials: true, timeout: 30000 });
api.interceptors.request.use(config => { const token = localStorage.getItem('accessToken'); if (token) config.headers.Authorization = `Bearer ${token}`; return config; });
api.interceptors.response.use(response => response, error => { if (error.response?.status === 401 && !error.config.url.includes('/login/')) { localStorage.removeItem('accessToken'); window.dispatchEvent(new Event('session-expired')); } return Promise.reject(error); });
export const messageFrom = error => error.response?.data?.message || error.message || 'Something went wrong';
export const notifyError = error => toast.error(messageFrom(error));
export default api;
