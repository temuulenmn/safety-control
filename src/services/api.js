import axios from 'axios'

// Strip trailing slashes; always append /api so the env can stay short
const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3500').replace(/\/+$/, '')

const client = axios.create({ baseURL: `${BASE_URL}/api` })

client.interceptors.request.use(cfg => {
  const token = localStorage.getItem('sys_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

client.interceptors.response.use(
  r => r.data,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sys_token')
      localStorage.removeItem('sys_user')
      window.location.href = '/#/login'
    }
    return Promise.reject(err)
  }
)

const api = {
  // Auth
  login: (data)                   => client.post('/auth/login', data),
  me:    ()                       => client.get('/auth/me'),

  // System overview
  getOverview:                    () => client.get('/system/overview'),

  // Companies
  getCompanies:                   () => client.get('/system/companies'),
  getCompany:       (id)          => client.get(`/system/companies/${id}`),
  createCompany:    (data)        => client.post('/system/companies', data),
  updateCompany:    (id, data)    => client.put(`/system/companies/${id}`, data),
  toggleCompany:    (id)          => client.post(`/system/companies/${id}/toggle`),

  // Company users
  getCompanyUsers:   (id)         => client.get(`/system/companies/${id}/users`),
  createCompanyUser: (id, data)   => client.post(`/system/companies/${id}/users`, data),
  deleteUser:        (uid)        => client.delete(`/system/users/${uid}`),

  // Users
  getAllUsers:                    () => client.get('/system/users'),
  resetPassword:    (uid, data)   => client.post(`/system/users/${uid}/reset-password`, data),
  toggleUser:       (uid)         => client.post(`/system/users/${uid}/toggle`),

  // Marketplace - items
  getMarketOverview: ()           => client.get('/system/marketplace/overview'),
  getMarketItems:   (params)      => client.get('/system/marketplace/items', { params }),
  createMarketItem: (data)        => client.post('/system/marketplace/items', data),
  updateMarketItem: (id, data)    => client.put(`/system/marketplace/items/${id}`, data),
  deleteMarketItem: (id)          => client.delete(`/system/marketplace/items/${id}`),

  // Training catalog (system admin)
  getTrainingCatalog:    (params)   => client.get('/system/training-catalog', { params }),
  createTrainingCatalog: (data)     => client.post('/system/training-catalog', data),
  updateTrainingCatalog: (id, data) => client.put(`/system/training-catalog/${id}`, data),
  deleteTrainingCatalog: (id)       => client.delete(`/system/training-catalog/${id}`),

  // Document library (norms + instructions)
  getDocuments:    (params)   => client.get('/system/documents', { params }),
  createDocument:  (data)     => client.post('/system/documents', data),
  updateDocument:  (id, data) => client.put(`/system/documents/${id}`, data),
  deleteDocument:  (id)       => client.delete(`/system/documents/${id}`),

  // Training orders (system view)
  getTrainingOrders:     (params)   => client.get('/system/training-orders', { params }),
  scheduleTraining:      (id, data) => client.post(`/system/training-orders/${id}/schedule`, data),
  startTraining:         (id)       => client.post(`/system/training-orders/${id}/start`),
  completeTraining:      (id)       => client.post(`/system/training-orders/${id}/complete`),

  // Marketplace - orders
  getMarketOrders:    (params)    => client.get('/system/marketplace/orders', { params }),
  getMarketOrder:     (id)        => client.get(`/system/marketplace/orders/${id}`),
  approveMarketOrder: (id)        => client.post(`/system/marketplace/orders/${id}/approve`),
  shipMarketOrder:    (id)        => client.post(`/system/marketplace/orders/${id}/ship`),
  deliverMarketOrder: (id)        => client.post(`/system/marketplace/orders/${id}/deliver`),
  cancelMarketOrder:  (id)        => client.post(`/system/marketplace/orders/${id}/cancel`),
}

export default api
