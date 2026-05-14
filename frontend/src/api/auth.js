import api from './api';

export const getCurrentUser = () => api.get('/users.php?action=me').then((r) => r.data);
export const registerUser = (payload) => api.post('/users.php?action=register', payload).then((r) => r.data);
export const loginUser = (payload) => api.post('/users.php?action=login', payload).then((r) => r.data);
export const logoutUser = () => api.post('/users.php?action=logout').then((r) => r.data);
export const getUsers = () => api.get('/users.php?action=all').then((r) => r.data);
export const approveUser = (id, role = 'operator') =>
    api.post(`/users.php?action=approve&id=${id}`, { role }).then((r) => r.data);
export const rejectUser = (id) => api.post(`/users.php?action=reject&id=${id}`).then((r) => r.data);
export const updateUser = (id, payload) => api.put(`/users.php?action=user&id=${id}`, payload).then((r) => r.data);
