import api from './api';

export const getProducts = () => api.get('/products.php').then((r) => r.data);
export const createProduct = (payload) => api.post('/products.php', payload).then((r) => r.data);
export const updateProduct = (id, payload) => api.put(`/products.php?id=${id}`, payload).then((r) => r.data);
export const removeProduct = (id) => api.delete(`/products.php?id=${id}`).then((r) => r.data);
