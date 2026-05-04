import api from './api'

export const getProfitLossReport = async (params = {}) => {
  const response = await api.get('/api/reports/profit-loss', { params })
  return response.data
}

export const getProductPerformanceReport = async (params = {}) => {
  const response = await api.get('/api/reports/product-perf', { params })
  return response.data
}

export const getCashFlowReport = async (params = {}) => {
  const response = await api.get('/api/reports/cash-flow', { params })
  return response.data
}

export const exportReport = async (reportType, format = 'pdf') => {
  const response = await api.post('/api/reports/export', {
    type: reportType,
    format,
  }, {
    responseType: 'blob',
  })
  return response.data
}
