import api from './api'

export const classifyTransaction = async (description) => {
  const response = await api.post('/api/ai/classify', {
    description,
  })
  return response.data
}

export const getInsights = async () => {
  const response = await api.get('/api/ai/insights')
  return response.data
}

export const predictSales = async (params = {}) => {
  const response = await api.post('/api/ai/predict', params)
  return response.data
}

export const getRecommendations = async () => {
  const response = await api.get('/api/ai/recommendations')
  return response.data
}
