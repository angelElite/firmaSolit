import api from './api'

export const authService = {
  login: (email, password) =>
    api.post('/auth/login/', { email, password }),
  refresh: (refresh) =>
    api.post('/auth/refresh/', { refresh }),
  me: () =>
    api.get('/auth/me/'),
}

export const clientService = {
  list: (params) => api.get('/clients/', { params }),
  get: (id) => api.get(`/clients/${id}/`),
  create: (data) => api.post('/clients/', data),
  update: (id, data) => api.put(`/clients/${id}/`, data),
  delete: (id) => api.delete(`/clients/${id}/`),
}

export const orderService = {
  list: (params) => api.get('/orders/', { params }),
  get: (id) => api.get(`/orders/${id}/`),
  create: (data) => api.post('/orders/', data),
  update: (id, data) => api.put(`/orders/${id}/`, data),
  changeStatus: (id, data) => api.post(`/orders/${id}/change-status/`, data),
  getHistory: (id) => api.get(`/orders/${id}/history/`),
  getItems: (id) => api.get(`/orders/${id}/items/`),
  addItem: (id, data) => api.post(`/orders/${id}/items/`, data),
  getPayments: (id) => api.get(`/payments/orders/${id}/payments/`),
  addPayment: (id, data) => api.post(`/payments/orders/${id}/payments/`, data),
}

export const catalogService = {
  materials: () => api.get('/catalogs/materials/'),
  acabados: () => api.get('/catalogs/acabados/'),
  unidades: () => api.get('/catalogs/unidades/'),
  canales: () => api.get('/catalogs/canales/'),
  prioridades: () => api.get('/catalogs/prioridades/'),
}
