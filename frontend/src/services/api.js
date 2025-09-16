import axios from 'axios'

// Configuração base da API
const API_BASE_URL = 'http://127.0.0.1:8000/api'

// Instância do axios com configurações padrão
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Serviços de Autenticação
export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (userData) => api.post('/auth/register/', userData),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (profileData) => api.patch('/auth/profile/', profileData),
  changePassword: (passwordData) => api.post('/auth/change-password/', passwordData),
  logout: () => api.post('/auth/logout/'),
}

// Serviços de Categorias
export const categoriesAPI = {
  getAll: () => api.get('/accounts/categories/'),
  getById: (id) => api.get(`/accounts/categories/${id}/`),
}

// Serviços de Solicitações de Serviço
export const serviceRequestsAPI = {
  getAll: (params = {}) => api.get('/requests/', { params }),
  getById: (id) => api.get(`/requests/${id}/`),
  create: (requestData) => api.post('/requests/', requestData),
  update: (id, requestData) => api.patch(`/requests/${id}/`, requestData),
  delete: (id) => api.delete(`/requests/${id}/`),
  getMyRequests: () => api.get('/requests/my/'),
}

// Serviços de Propostas/Atribuições
export const assignmentsAPI = {
  getAll: (params = {}) => api.get('/assignments/', { params }),
  getById: (id) => api.get(`/assignments/${id}/`),
  create: (assignmentData) => api.post('/assignments/', assignmentData),
  update: (id, assignmentData) => api.patch(`/assignments/${id}/`, assignmentData),
  accept: (id) => api.post(`/assignments/${id}/accept/`),
  start: (id) => api.post(`/assignments/${id}/start/`),
  complete: (id) => api.post(`/assignments/${id}/complete/`),
  cancel: (id) => api.post(`/assignments/${id}/cancel/`),
  getMyAssignments: () => api.get('/assignments/my/'),
}

// Serviços de Prestadores
export const providersAPI = {
  getAll: (params = {}) => api.get('/accounts/providers/', { params }),
  getById: (id) => api.get(`/accounts/providers/${id}/`),
  updateProfile: (profileData) => api.patch('/accounts/providers/profile/', profileData),
  getMyProfile: () => api.get('/accounts/providers/my-profile/'),
}

// Serviços de Avaliações
export const reviewsAPI = {
  getAll: (params = {}) => api.get('/reviews/', { params }),
  getById: (id) => api.get(`/reviews/${id}/`),
  create: (reviewData) => api.post('/reviews/', reviewData),
  update: (id, reviewData) => api.patch(`/reviews/${id}/`, reviewData),
  delete: (id) => api.delete(`/reviews/${id}/`),
  getByProvider: (providerId) => api.get(`/reviews/provider/${providerId}/`),
  getMyReviews: () => api.get('/reviews/my/'),
  getReviewStats: (userId) => api.get(`/reviews/stats/${userId}/`),
  getJobReview: (jobId) => api.get(`/reviews/job/${jobId}/`),
}

// Serviços de Notificações
export const notificationsAPI = {
  getAll: (params = {}) => api.get('/notifications/', { params }),
  getById: (id) => api.get(`/notifications/${id}/`),
  markAsRead: (id) => api.patch(`/notifications/${id}/`, { read: true }),
  markAllAsRead: () => api.post('/notifications/mark-read/'),
  delete: (id) => api.delete(`/notifications/${id}/`),
  getUnreadCount: () => api.get('/notifications/unread-count/'),
}

// Serviços de Estatísticas
export const statisticsAPI = {
  getClientStats: () => api.get('/statistics/'),
  getProviderStats: () => api.get('/statistics/'),
  getDashboardData: () => api.get('/statistics/'),
}

// Objeto principal com todos os serviços
export const apiService = {
  auth: authAPI,
  categories: categoriesAPI,
  serviceRequests: serviceRequestsAPI,
  assignments: assignmentsAPI,
  providers: providersAPI,
  reviews: reviewsAPI,
  notifications: notificationsAPI,
  statistics: statisticsAPI,
  
  // Métodos de conveniência para compatibilidade
  getCategories: () => categoriesAPI.getAll(),
  getServiceRequests: (params) => serviceRequestsAPI.getAll(params),
  createServiceRequest: (requestData) => serviceRequestsAPI.create(requestData),
  getClientStats: () => statisticsAPI.getClientStats(),
  getProviderStats: () => statisticsAPI.getProviderStats(),
  
  // Métodos que estavam faltando
  getOpportunities: (params) => serviceRequestsAPI.getAll(params),
  getMyProposals: (params) => assignmentsAPI.getAll(params),
  getMyJobs: (params) => assignmentsAPI.getAll({ ...params, status: 'assigned' }),
  completeJob: (id) => assignmentsAPI.complete(id),
  createProposal: (proposalData) => assignmentsAPI.create(proposalData),
  getServiceRequest: (id) => serviceRequestsAPI.getById(id),
  getServiceRequestProposals: (id) => assignmentsAPI.getAll({ service_request: id }),
}

export default api