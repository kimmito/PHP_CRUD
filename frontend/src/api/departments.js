import api from './api';

export const getDepartments = () => api.get('/departments.php').then((r) => r.data);
export const createDepartment = (payload) => api.post('/departments.php', payload).then((r) => r.data);
export const updateDepartment = (id, payload) => api.put(`/departments.php?id=${id}`, payload).then((r) => r.data);
export const removeDepartment = (id) => api.delete(`/departments.php?id=${id}`).then((r) => r.data);
