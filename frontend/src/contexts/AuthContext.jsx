import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token')
      if (storedToken) {
        try {
          const userData = await authAPI.getProfile()
          setUser(userData)
          setToken(storedToken)
        } catch (error) {
          console.error('Erro ao carregar perfil:', error)
          localStorage.removeItem('token')
          setToken(null)
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials)
      const { access, user: userData } = response
      
      localStorage.setItem('token', access)
      setToken(access)
      setUser(userData)
      
      toast.success('Login realizado com sucesso!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.detail || 'Erro ao fazer login'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const register = async (userData) => {
    try {
      await authAPI.register(userData)
      toast.success('Cadastro realizado com sucesso! Faça login para continuar.')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Erro ao fazer cadastro'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    toast.success('Logout realizado com sucesso!')
  }

  const updateProfile = async (profileData) => {
    try {
      const updatedUser = await authAPI.updateProfile(profileData)
      setUser(updatedUser)
      toast.success('Perfil atualizado com sucesso!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Erro ao atualizar perfil'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!token && !!user,
    isClient: user?.user_type === 'client',
    isProvider: user?.user_type === 'provider'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}