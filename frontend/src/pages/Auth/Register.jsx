import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../contexts/AuthContext'
import { EyeIcon, EyeSlashIcon, HomeIcon } from '@heroicons/react/24/outline'
import { categoriesAPI } from '../../services/api'

const Register = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch
  } = useForm()

  const userType = watch('user_type')
  const password = watch('password')

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesAPI.getAll()
        setCategories(response)
      } catch (error) {
        console.error('Erro ao carregar categorias:', error)
      }
    }
    fetchCategories()
  }, [])

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const result = await registerUser({
        username: data.username,
        email: data.email,
        password: data.password,
        password_confirm: data.password_confirm,
        first_name: data.first_name,
        last_name: data.last_name,
        phone_number: data.phone_number,
        user_type: data.user_type,
        city: data.city,
        state: data.state,
        address: data.address,
        service_categories: data.service_categories || []
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
    <div className="min-h-screen py-8 bg-gradient-to-br from-primary/10 to-secondary/10">
      <div className="container mx-auto px-4">
        <div className="card w-full max-w-2xl mx-auto bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <HomeIcon className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-montserrat font-bold text-primary">Serviço em Casa</h1>
              </div>
              <p className="text-base-content/70 mt-2 font-lato">Crie sua conta</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* User Type */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-montserrat font-medium">Tipo de usuário</span>
                </label>
                <select
                  className={`select select-bordered w-full ${
                    errors.user_type ? 'select-error' : ''
                  }`}
                  {...register('user_type', {
                    required: 'Tipo de usuário é obrigatório'
                  })}
                >
                  <option value="">Selecione o tipo de usuário</option>
                  <option value="client">Cliente</option>
                  <option value="provider">Prestador de Serviço</option>
                </select>
                {errors.user_type && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.user_type.message}
                    </span>
                  </label>
                )}
              </div>

              {/* Personal Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Nome</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Digite seu nome"
                    className={`input input-bordered w-full ${
                      errors.first_name ? 'input-error' : ''
                    }`}
                    {...register('first_name', {
                      required: 'Nome é obrigatório'
                    })}
                  />
                  {errors.first_name && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {errors.first_name.message}
                      </span>
                    </label>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Sobrenome</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Digite seu sobrenome"
                    className={`input input-bordered w-full ${
                      errors.last_name ? 'input-error' : ''
                    }`}
                    {...register('last_name', {
                      required: 'Sobrenome é obrigatório'
                    })}
                  />
                  {errors.last_name && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {errors.last_name.message}
                      </span>
                    </label>
                  )}
                </div>
              </div>

              {/* Username and Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Usuário</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Digite seu usuário"
                    className={`input input-bordered w-full ${
                      errors.username ? 'input-error' : ''
                    }`}
                    {...register('username', {
                      required: 'Usuário é obrigatório',
                      minLength: {
                        value: 3,
                        message: 'Usuário deve ter pelo menos 3 caracteres'
                      }
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

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Email</span>
                  </label>
                  <input
                    type="email"
                    placeholder="Digite seu email"
                    className={`input input-bordered w-full ${
                      errors.email ? 'input-error' : ''
                    }`}
                    {...register('email', {
                      required: 'Email é obrigatório',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Email inválido'
                      }
                    })}
                  />
                  {errors.email && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {errors.email.message}
                      </span>
                    </label>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Telefone</span>
                </label>
                <input
                  type="tel"
                  placeholder="(11) 99999-9999"
                  className={`input input-bordered w-full ${
                    errors.phone_number ? 'input-error' : ''
                  }`}
                  {...register('phone_number', {
                    required: 'Telefone é obrigatório'
                  })}
                />
                {errors.phone_number && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.phone_number.message}
                    </span>
                  </label>
                )}
              </div>

              {/* Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Cidade</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Digite sua cidade"
                    className={`input input-bordered w-full ${
                      errors.city ? 'input-error' : ''
                    }`}
                    {...register('city', {
                      required: 'Cidade é obrigatória'
                    })}
                  />
                  {errors.city && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {errors.city.message}
                      </span>
                    </label>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Estado</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Digite seu estado"
                    className={`input input-bordered w-full ${
                      errors.state ? 'input-error' : ''
                    }`}
                    {...register('state', {
                      required: 'Estado é obrigatório'
                    })}
                  />
                  {errors.state && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {errors.state.message}
                      </span>
                    </label>
                  )}
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Endereço</span>
                </label>
                <input
                  type="text"
                  placeholder="Digite seu endereço completo"
                  className={`input input-bordered w-full ${
                    errors.address ? 'input-error' : ''
                  }`}
                  {...register('address', {
                    required: 'Endereço é obrigatório'
                  })}
                />
                {errors.address && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.address.message}
                    </span>
                  </label>
                )}
              </div>

              {/* Service Categories for Providers */}
              {userType === 'provider' && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Categorias de Serviço</span>
                  </label>
                  <select
                    multiple
                    className={`select select-bordered w-full h-32 ${
                      errors.service_categories ? 'select-error' : ''
                    }`}
                    {...register('service_categories', {
                      required: userType === 'provider' ? 'Selecione pelo menos uma categoria' : false
                    })}
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <label className="label">
                    <span className="label-text-alt">Segure Ctrl para selecionar múltiplas categorias</span>
                  </label>
                  {errors.service_categories && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {errors.service_categories.message}
                      </span>
                    </label>
                  )}
                </div>
              )}

              {/* Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Senha</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Digite sua senha"
                      className={`input input-bordered w-full pr-12 ${
                        errors.password ? 'input-error' : ''
                      }`}
                      {...register('password', {
                        required: 'Senha é obrigatória',
                        minLength: {
                          value: 8,
                          message: 'Senha deve ter pelo menos 8 caracteres'
                        }
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

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Confirmar Senha</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirme sua senha"
                      className={`input input-bordered w-full pr-12 ${
                        errors.password_confirm ? 'input-error' : ''
                      }`}
                      {...register('password_confirm', {
                        required: 'Confirmação de senha é obrigatória',
                        validate: value => value === password || 'Senhas não coincidem'
                      })}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.password_confirm && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {errors.password_confirm.message}
                      </span>
                    </label>
                  )}
                </div>
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
                  className={`btn btn-primary w-full ${
                    isLoading ? 'loading' : ''
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? 'Criando conta...' : 'Criar conta'}
                </button>
              </div>
            </form>

            <div className="divider">OU</div>

            <div className="text-center">
              <p className="text-sm text-base-content/70">
                Já tem uma conta?{' '}
                <Link to="/login" className="link link-primary">
                  Faça login
                </Link>
              </p>
            </div>

            <div className="text-center mt-4">
              <Link to="/" className="link link-neutral text-sm">
                ← Voltar para o início
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register