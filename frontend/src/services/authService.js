import api from './api'

export const register = async (name, email, password, businessName) => {
  const response = await api.post('/api/auth/register', {
    name,
    email,
    password,
    business_name: businessName,
  })
  return response.data
}

export const login = async (email, password) => {
  const response = await api.post('/api/auth/login', {
    email,
    password,
  })
  return response.data
}

export const logout = async () => {
  const response = await api.post('/api/auth/logout')
  return response.data
}

export const getCurrentUser = async () => {
  const response = await api.get('/api/auth/me')
  return response.data
}

export const updateProfile = async (data) => {
  const response = await api.put('/api/auth/profile', data)
  return response.data
}

export const refreshToken = async () => {
  const response = await api.post('/api/auth/refresh-token')
  return response.data
}
