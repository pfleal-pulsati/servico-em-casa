import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { EyeIcon, EyeSlashIcon, KeyIcon, CheckIcon } from '@heroicons/react/24/outline'
import { apiService } from '../../services/api'

const ChangePassword = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm()

  const newPassword = watch('new_password')

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await apiService.changePassword({
        old_password: data.current_password,
        new_password: data.new_password,
        new_password_confirm: data.confirm_password
      })
      
      toast.success('Senha alterada com sucesso! Você será redirecionado.')
      reset()
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
      
    } catch (error) {
      console.error('Erro ao alterar senha:', error)
      if (error.response?.data) {
        Object.keys(error.response.data).forEach(key => {
          if (key === 'old_password' || key === 'new_password') {
            // Mapear erros do backend para os campos do formulário
            toast.error(error.response.data[key][0])
          }
        })
      } else {
        toast.error('Erro ao alterar senha')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl">
        <div className="card-body">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="avatar placeholder mb-4">
              <div className="bg-primary text-primary-content rounded-full w-16">
                <KeyIcon className="h-8 w-8" />
              </div>
            </div>
            <h1 className="text-2xl font-bold">Alteração Obrigatória</h1>
            <p className="text-base-content/70 mt-2">
              Sua senha é temporária. Por favor, defina uma nova senha para continuar.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Senha Atual */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Senha Atual *</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="Digite sua senha atual"
                  className={`input input-bordered w-full pr-12 ${
                    errors.current_password ? 'input-error' : ''
                  }`}
                  {...register('current_password', {
                    required: 'Senha atual é obrigatória'
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 btn btn-ghost btn-sm btn-circle"
                >
                  {showCurrentPassword ? (
                    <EyeSlashIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.current_password && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.current_password.message}
                  </span>
                </label>
              )}
            </div>

            {/* Nova Senha */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Nova Senha *</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Digite sua nova senha"
                  className={`input input-bordered w-full pr-12 ${
                    errors.new_password ? 'input-error' : ''
                  }`}
                  {...register('new_password', {
                    required: 'Nova senha é obrigatória',
                    minLength: {
                      value: 8,
                      message: 'Senha deve ter pelo menos 8 caracteres'
                    }
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 btn btn-ghost btn-sm btn-circle"
                >
                  {showNewPassword ? (
                    <EyeSlashIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.new_password && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.new_password.message}
                  </span>
                </label>
              )}
            </div>

            {/* Confirmar Nova Senha */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Confirmar Nova Senha *</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirme sua nova senha"
                  className={`input input-bordered w-full pr-12 ${
                    errors.confirm_password ? 'input-error' : ''
                  }`}
                  {...register('confirm_password', {
                    required: 'Confirmação de senha é obrigatória',
                    validate: value =>
                      value === newPassword || 'Senhas não coincidem'
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 btn btn-ghost btn-sm btn-circle"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirm_password && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.confirm_password.message}
                  </span>
                </label>
              )}
            </div>

            {/* Submit Button */}
            <div className="form-control mt-6">
              <button
                type="submit"
                className={`btn btn-primary gap-2 ${
                  isLoading ? 'loading' : ''
                }`}
                disabled={isLoading}
              >
                {!isLoading && <CheckIcon className="h-4 w-4" />}
                {isLoading ? 'Alterando...' : 'Alterar Senha'}
              </button>
            </div>
          </form>

          {/* Info */}
          <div className="alert alert-info mt-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span className="text-sm">
              Após alterar sua senha, você será redirecionado automaticamente.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChangePassword