import { api, getApiBaseUrl } from './api.js'

const normalizeEndpoint = (endpoint) => {
  const trimmed = String(endpoint || '').trim()
  if (!trimmed) {
    return '/'
  }

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

export const buildMockUrl = (endpoint) => {
  return `${getApiBaseUrl()}/mock${normalizeEndpoint(endpoint)}`
}

export const buildPublicMockUrl = (shareToken) => {
  if (!shareToken) {
    return ''
  }

  return `${getApiBaseUrl()}/public/mock/${shareToken}`
}

export const listMockApis = async (params = {}) => {
  const response = await api.get('/api/mock', { params })
  return response.data
}

export const getMockApi = async (id) => {
  const response = await api.get(`/api/mock/${id}`)
  return response.data
}

export const createMockApi = async (payload) => {
  const response = await api.post('/api/mock', payload)
  return response.data
}

export const updateMockApi = async (id, payload) => {
  const response = await api.put(`/api/mock/${id}`, payload)
  return response.data
}

export const deleteMockApi = async (id) => {
  const response = await api.delete(`/api/mock/${id}`)
  return response.data
}

export const duplicateMockApi = async (id) => {
  const response = await api.post(`/api/mock/${id}/duplicate`)
  return response.data
}

export const toggleMockApi = async (id) => {
  const response = await api.patch(`/api/mock/${id}/toggle`)
  return response.data
}

export const shareMockApi = async (id) => {
  const response = await api.post(`/api/mock/${id}/share`)
  return response.data
}

export const revokeMockApiShare = async (id) => {
  const response = await api.delete(`/api/mock/${id}/share`)
  return response.data
}

export const exportMocks = async () => {
  const response = await api.get('/api/mock/export')
  return response.data
}

export const importMocks = async (mocksData) => {
  const response = await api.post('/api/mock/import', { mocks: mocksData })
  return response.data
}

export const getCallLogs = async (id, limit = 50, offset = 0) => {
  const response = await api.get(`/api/mock/${id}/call-logs`, { params: { limit, offset } })
  return response.data
}

export const clearCallLogs = async (id) => {
  const response = await api.delete(`/api/mock/${id}/call-logs`)
  return response.data
}

export const getWebhookCalls = async (id, limit = 50, offset = 0) => {
  const response = await api.get(`/api/mock/${id}/webhook-calls`, { params: { limit, offset } })
  return response.data
}

export const clearWebhookCalls = async (id) => {
  const response = await api.delete(`/api/mock/${id}/webhook-calls`)
  return response.data
}
