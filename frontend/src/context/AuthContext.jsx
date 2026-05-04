import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

const createFallbackUser = (email, name = 'SiDoku User') => ({
  id: 'local-user',
  name,
  email,
  business_name: 'SiDoku',
})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token')
      const localUser = localStorage.getItem('user')

      if (token && localUser) {
        try {
          setUser(JSON.parse(localUser))
        } catch (err) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (email) => {
    setError(null)
    const fallbackUser = createFallbackUser(email)
    localStorage.setItem('token', 'local-auth-token')
    localStorage.setItem('user', JSON.stringify(fallbackUser))
    setUser(fallbackUser)
    return fallbackUser
  }

  const register = async (name, email, password, businessName) => {
    setError(null)
    const fallbackUser = createFallbackUser(email, name)
    fallbackUser.business_name = businessName || 'SiDoku'
    localStorage.setItem('token', 'local-auth-token')
    localStorage.setItem('user', JSON.stringify(fallbackUser))
    setUser(fallbackUser)
    return fallbackUser
  }

  const logout = async () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const updateProfile = async (data) => {
    setError(null)
    const updatedUser = { ...user, ...data }
    localStorage.setItem('user', JSON.stringify(updatedUser))
    setUser(updatedUser)
    return updatedUser
  }

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
