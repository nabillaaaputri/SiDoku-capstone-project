import api from './api'

export const getDashboardSummary = async (params = {}) => {
  const response = await api.get('/api/dashboard/summary', { params })
  return response.data
}

export const getDashboardTrends = async (params = {}) => {
  const response = await api.get('/api/dashboard/trends', { params })
  return response.data
}

export const getDashboardAlerts = async () => {
  const response = await api.get('/api/dashboard/alerts')
  return response.data
}

export const getDashboardOverview = async (params = {}) => {
  const response = await api.get('/api/dashboard/overview', { params })
  return response.data
}
