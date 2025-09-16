import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../contexts/AuthContext'
import { EyeIcon, EyeSlashIcon, HomeIcon } from '@heroicons/react/24/outline'

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm()

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const result = await login({
        username: data.username,
        password: data.password
      })
      
      if (result.success) {
        navigate('/dashboard')
      } else {
        setError('root', { message: result.error })
      }
    } catch (error) {
      setError('root', { message: 'Erro inesperado. Tente novamente.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <HomeIcon className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-montserrat font-bold text-primary">Serviço em Casa</h1>
            </div>
            <p className="text-base-content/70 mt-2 font-lato">Entre na sua conta</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Username */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-montserrat font-medium">Usuário ou Email</span>
              </label>
              <input
                type="text"
                placeholder="Digite seu usuário ou email"
                className={`input input-bordered w-full ${
                  errors.username ? 'input-error' : ''
                }`}
                {...register('username', {
                  required: 'Usuário ou email é obrigatório'
                })}
              />
              {errors.username && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.username.message}
                  </span>
                </label>
              )}
            </div>

            {/* Password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-montserrat font-medium">Senha</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Digite sua senha"
                  className={`input input-bordered w-full pr-12 ${
                    errors.password ? 'input-error' : ''
                  }`}
                  {...register('password', {
                    required: 'Senha é obrigatória'
                  })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.password.message}
                  </span>
                </label>
              )}
            </div>

            {/* Error message */}
            {errors.root && (
              <div className="alert alert-error">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{errors.root.message}</span>
              </div>
            )}

            {/* Submit button */}
            <div className="form-control mt-6">
              <button
                type="submit"
                className={`btn-primary w-full ${
                  isLoading ? 'loading' : ''
                }`}
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </div>
          </form>

          <div className="divider">OU</div>

          <div className="text-center">
            <p className="text-sm text-base-content/70 font-lato">
              Não tem uma conta?{' '}
              <Link to="/register" className="link link-primary font-montserrat font-medium">
                Cadastre-se
              </Link>
            </p>
          </div>

          <div className="text-center mt-4">
            <Link to="/" className="link link-neutral text-sm font-lato">
              ← Voltar para o início
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login