import api from './api'

export const getProducts = async (params = {}) => {
  const response = await api.get('/api/products', { params })
  return response.data
}

export const getProductById = async (id) => {
  const response = await api.get(`/api/products/${id}`)
  return response.data
}

export const createProduct = async (data) => {
  const response = await api.post('/api/products', data)
  return response.data
}

export const updateProduct = async (id, data) => {
  const response = await api.put(`/api/products/${id}`, data)
  return response.data
}

export const deleteProduct = async (id) => {
  const response = await api.delete(`/api/products/${id}`)
  return response.data
}

export const getLowStockProducts = async () => {
  const response = await api.get('/api/products/low-stock')
  return response.data
}

export const bulkUpdateProducts = async (data) => {
  const response = await api.post('/api/products/bulk-update', data)
  return response.data
}
