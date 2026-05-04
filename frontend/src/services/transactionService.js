import api from './api'

export const getTransactions = async (params = {}) => {
  const response = await api.get('/api/transactions', { params })
  return response.data
}

export const getTransactionById = async (id) => {
  const response = await api.get(`/api/transactions/${id}`)
  return response.data
}

export const recordIncomeTransaction = async (data) => {
  const response = await api.post('/api/transactions/income', data)
  return response.data
}

export const recordExpenseTransaction = async (data) => {
  const response = await api.post('/api/transactions/expense', data)
  return response.data
}

export const updateTransaction = async (id, data) => {
  const response = await api.put(`/api/transactions/${id}`, data)
  return response.data
}

export const deleteTransaction = async (id) => {
  const response = await api.delete(`/api/transactions/${id}`)
  return response.data
}

export const getTransactionSummary = async (params = {}) => {
  const response = await api.get('/api/transactions/summary', { params })
  return response.data
}
