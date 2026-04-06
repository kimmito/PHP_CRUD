import api from './api';

export const getSales = () => api.get('/sales.php').then((r) => r.data);
export const createSale = (payload) => api.post('/sales.php', payload).then((r) => r.data);
export const updateSale = (id, payload) => api.put(`/sales.php?id=${id}`, payload).then((r) => r.data);
export const removeSale = (id) => api.delete(`/sales.php?id=${id}`).then((r) => r.data);
