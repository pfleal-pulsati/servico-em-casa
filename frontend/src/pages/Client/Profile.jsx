import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../contexts/AuthContext'
import { apiService } from '../../services/api'
import {
  UserIcon,
  PencilIcon,
  CameraIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'
import ReviewsList from '../../components/ReviewsList'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [profilePicture, setProfilePicture] = useState(null)
  const [profilePicturePreview, setProfilePicturePreview] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState({
    total_requests: 0,
    completed_requests: 0,
    pending_requests: 0,
    total_spent: 0
  })

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
    setValue: setProfileValue
  } = useForm()

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch: watchPassword
  } = useForm()

  const newPassword = watchPassword('new_password')

  useEffect(() => {
    if (user) {
      resetProfile({
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        email: user.email,
        phone_number: user.phone_number,
        city: user.city,
        state: user.state,
        address: user.address
      })
      fetchUserStats()
    }
  }, [user, resetProfile])

  const fetchUserStats = async () => {
    try {
      const response = await apiService.getUserStats()
      setStats(response.data)
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const handleProfilePictureChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast.error('Imagem muito grande. Máximo 5MB.')
        return
      }

      setProfilePicture(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfilePicturePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmitProfile = async (data) => {
    setIsLoading(true)
    try {
      const formData = new FormData()
      
      // Add profile data
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
          formData.append(key, data[key])
        }
      })

      // Add profile picture if selected
      if (profilePicture) {
        formData.append('profile_picture', profilePicture)
      }

      const response = await apiService.updateProfile(formData)
      await updateProfile(response.data)
      
      toast.success('Perfil atualizado com sucesso!')
      setIsEditing(false)
      setProfilePicture(null)
      setProfilePicturePreview(null)
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      if (error.response?.data) {
        Object.keys(error.response.data).forEach(key => {
          if (profileErrors[key]) {
            setError(key, { message: error.response.data[key][0] })
          }
        })
      } else {
        toast.error('Erro ao atualizar perfil')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmitPassword = async (data) => {
    setIsLoading(true)
    try {
      await apiService.changePassword({
        old_password: data.current_password,
        new_password: data.new_password,
        new_password_confirm: data.confirm_password
      })
      
      toast.success('Senha alterada com sucesso!')
      setIsChangingPassword(false)
      resetPassword()
    } catch (error) {
      console.error('Erro ao alterar senha:', error)
      if (error.response?.data) {
        Object.keys(error.response.data).forEach(key => {
          if (passwordErrors[key]) {
            setError(key, { message: error.response.data[key][0] })
          }
        })
      } else {
        toast.error('Erro ao alterar senha')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setProfilePicture(null)
    setProfilePicturePreview(null)
    resetProfile({
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      email: user.email,
      phone_number: user.phone_number,
      city: user.city,
      state: user.state,
      address: user.address
    })
  }

  const cancelPasswordChange = () => {
    setIsChangingPassword(false)
    resetPassword()
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <div className="breadcrumbs text-sm mb-6">
          <ul>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li>Perfil</li>
          </ul>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Profile Picture */}
                  <div className="relative">
                    <div className="avatar">
                      <div className="w-24 h-24 rounded-full">
                        {profilePicturePreview ? (
                          <img src={profilePicturePreview} alt="Preview" />
                        ) : user.profile_picture ? (
                          <img src={user.profile_picture} alt={user.first_name} />
                        ) : (
                          <div className="bg-primary text-primary-content flex items-center justify-center">
                            <UserIcon className="h-12 w-12" />
                          </div>
                        )}
                      </div>
                    </div>
                    {isEditing && (
                      <>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePictureChange}
                          className="hidden"
                          id="profile-picture-input"
                        />
                        <label
                          htmlFor="profile-picture-input"
                          className="absolute -bottom-2 -right-2 btn btn-circle btn-sm btn-primary cursor-pointer"
                        >
                          <CameraIcon className="h-4 w-4" />
                        </label>
                      </>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="text-center sm:text-left flex-1">
                    <h1 className="text-2xl font-bold">
                      {user.first_name} {user.last_name}
                    </h1>
                    <p className="text-base-content/70">@{user.username}</p>
                    <div className="badge badge-primary mt-2">Cliente</div>
                  </div>

                  {/* Edit Button */}
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn btn-outline gap-2"
                    >
                      <PencilIcon className="h-4 w-4" />
                      Editar Perfil
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title mb-4">Informações Pessoais</h2>
                
                <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-4">
                  {/* Name */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Nome *</span>
                      </label>
                      <input
                        type="text"
                        className={`input input-bordered ${
                          !isEditing ? 'input-disabled' : ''
                        } ${profileErrors.first_name ? 'input-error' : ''}`}
                        disabled={!isEditing}
                        {...registerProfile('first_name', {
                          required: 'Nome é obrigatório'
                        })}
                      />
                      {profileErrors.first_name && (
                        <label className="label">
                          <span className="label-text-alt text-error">
                            {profileErrors.first_name.message}
                          </span>
                        </label>
                      )}
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Sobrenome *</span>
                      </label>
                      <input
                        type="text"
                        className={`input input-bordered ${
                          !isEditing ? 'input-disabled' : ''
                        } ${profileErrors.last_name ? 'input-error' : ''}`}
                        disabled={!isEditing}
                        {...registerProfile('last_name', {
                          required: 'Sobrenome é obrigatório'
                        })}
                      />
                      {profileErrors.last_name && (
                        <label className="label">
                          <span className="label-text-alt text-error">
                            {profileErrors.last_name.message}
                          </span>
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Username and Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Nome de Usuário *</span>
                      </label>
                      <input
                        type="text"
                        className={`input input-bordered ${
                          !isEditing ? 'input-disabled' : ''
                        } ${profileErrors.username ? 'input-error' : ''}`}
                        disabled={!isEditing}
                        {...registerProfile('username', {
                          required: 'Nome de usuário é obrigatório'
                        })}
                      />
                      {profileErrors.username && (
                        <label className="label">
                          <span className="label-text-alt text-error">
                            {profileErrors.username.message}
                          </span>
                        </label>
                      )}
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Email *</span>
                      </label>
                      <input
                        type="email"
                        className={`input input-bordered ${
                          !isEditing ? 'input-disabled' : ''
                        } ${profileErrors.email ? 'input-error' : ''}`}
                        disabled={!isEditing}
                        {...registerProfile('email', {
                          required: 'Email é obrigatório',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Email inválido'
                          }
                        })}
                      />
                      {profileErrors.email && (
                        <label className="label">
                          <span className="label-text-alt text-error">
                            {profileErrors.email.message}
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
                      className={`input input-bordered ${
                        !isEditing ? 'input-disabled' : ''
                      }`}
                      disabled={!isEditing}
                      {...registerProfile('phone_number')}
                    />
                  </div>

                  {/* Location */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Cidade</span>
                      </label>
                      <input
                        type="text"
                        className={`input input-bordered ${
                          !isEditing ? 'input-disabled' : ''
                        }`}
                        disabled={!isEditing}
                        {...registerProfile('city')}
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Estado</span>
                      </label>
                      <input
                        type="text"
                        className={`input input-bordered ${
                          !isEditing ? 'input-disabled' : ''
                        }`}
                        disabled={!isEditing}
                        {...registerProfile('state')}
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Endereço</span>
                    </label>
                    <textarea
                      className={`textarea textarea-bordered ${
                        !isEditing ? 'textarea-disabled' : ''
                      }`}
                      disabled={!isEditing}
                      {...registerProfile('address')}
                    ></textarea>
                  </div>

                  {/* Action Buttons */}
                  {isEditing && (
                    <div className="flex gap-4 justify-end">
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="btn btn-ghost gap-2"
                        disabled={isLoading}
                      >
                        <XMarkIcon className="h-4 w-4" />
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className={`btn btn-primary gap-2 ${
                          isLoading ? 'loading' : ''
                        }`}
                        disabled={isLoading}
                      >
                        {!isLoading && <CheckIcon className="h-4 w-4" />}
                        {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Password Change */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="card-title">Alterar Senha</h2>
                  {!isChangingPassword && (
                    <button
                      onClick={() => setIsChangingPassword(true)}
                      className="btn btn-outline btn-sm"
                    >
                      Alterar Senha
                    </button>
                  )}
                </div>

                {isChangingPassword ? (
                  <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
                    {/* Current Password */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Senha Atual *</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          className={`input input-bordered w-full pr-12 ${
                            passwordErrors.current_password ? 'input-error' : ''
                          }`}
                          {...registerPassword('current_password', {
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
                      {passwordErrors.current_password && (
                        <label className="label">
                          <span className="label-text-alt text-error">
                            {passwordErrors.current_password.message}
                          </span>
                        </label>
                      )}
                    </div>

                    {/* New Password */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Nova Senha *</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          className={`input input-bordered w-full pr-12 ${
                            passwordErrors.new_password ? 'input-error' : ''
                          }`}
                          {...registerPassword('new_password', {
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
                      {passwordErrors.new_password && (
                        <label className="label">
                          <span className="label-text-alt text-error">
                            {passwordErrors.new_password.message}
                          </span>
                        </label>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Confirmar Nova Senha *</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          className={`input input-bordered w-full pr-12 ${
                            passwordErrors.confirm_password ? 'input-error' : ''
                          }`}
                          {...registerPassword('confirm_password', {
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
                      {passwordErrors.confirm_password && (
                        <label className="label">
                          <span className="label-text-alt text-error">
                            {passwordErrors.confirm_password.message}
                          </span>
                        </label>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 justify-end">
                      <button
                        type="button"
                        onClick={cancelPasswordChange}
                        className="btn btn-ghost gap-2"
                        disabled={isLoading}
                      >
                        <XMarkIcon className="h-4 w-4" />
                        Cancelar
                      </button>
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
                ) : (
                  <p className="text-base-content/70">
                    Clique em "Alterar Senha" para modificar sua senha atual.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Contact Info */}
            <div className="card bg-base-100 shadow-lg mb-6">
              <div className="card-body">
                <h3 className="card-title text-lg mb-4">Informações de Contato</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <EnvelopeIcon className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-base-content/70">Email</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                  </div>
                  
                  {user.phone_number && (
                    <div className="flex items-center gap-3">
                      <PhoneIcon className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-base-content/70">Telefone</p>
                        <p className="font-medium">{user.phone_number}</p>
                      </div>
                    </div>
                  )}
                  
                  {(user.city || user.state) && (
                    <div className="flex items-start gap-3">
                      <MapPinIcon className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <p className="text-sm text-base-content/70">Localização</p>
                        <p className="font-medium">
                          {[user.city, user.state].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h3 className="card-title text-lg mb-4">Estatísticas</h3>
                
                <div className="space-y-4">
                  <div className="stat">
                    <div className="stat-title">Total de Solicitações</div>
                    <div className="stat-value text-primary">{stats.total_requests}</div>
                  </div>
                  
                  <div className="stat">
                    <div className="stat-title">Serviços Concluídos</div>
                    <div className="stat-value text-success">{stats.completed_requests}</div>
                  </div>
                  
                  <div className="stat">
                    <div className="stat-title">Pendentes</div>
                    <div className="stat-value text-warning">{stats.pending_requests}</div>
                  </div>
                  
                  <div className="stat">
                    <div className="stat-title">Total Gasto</div>
                    <div className="stat-value text-info">
                      R$ {parseFloat(stats.total_spent || 0).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <ReviewsList 
            userId={user.id} 
            userType="client" 
            showTitle={true}
          />
        </div>
      </div>
    </div>
  )
}

export default Profile