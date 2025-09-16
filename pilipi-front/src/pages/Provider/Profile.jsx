import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CameraIcon,
  EyeIcon,
  EyeSlashIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  StarIcon,
  CurrencyDollarIcon,
  BriefcaseIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import ReviewsList from '../../components/ReviewsList';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [stats, setStats] = useState({
    totalOpportunities: 0,
    pendingProposals: 0,
    activeJobs: 0,
    completedJobs: 0,
    totalEarnings: 0,
    averageRating: 0,
    totalReviews: 0
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const {
    register: registerPersonal,
    handleSubmit: handleSubmitPersonal,
    formState: { errors: errorsPersonal },
    reset: resetPersonal
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      surname: user?.surname || '',
      username: user?.username || '',
      email: user?.email || '',
      phone: user?.phone || '',
      city: user?.city || '',
      state: user?.state || '',
      address: user?.address || ''
    }
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: errorsPassword },
    reset: resetPassword,
    watch
  } = useForm();

  const newPassword = watch('newPassword');

  useEffect(() => {
    fetchCategories();
    fetchProviderStats();
    if (user?.categories) {
      setSelectedCategories(user.categories.map(cat => cat.id));
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      resetPersonal({
        name: user.name || '',
        surname: user.surname || '',
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        city: user.city || '',
        state: user.state || '',
        address: user.address || ''
      });
    }
  }, [user, resetPersonal]);

  const fetchCategories = async () => {
    try {
      const response = await apiService.getCategories();
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const fetchProviderStats = async () => {
    try {
      const response = await apiService.getProviderStats();
      setStats(response.data || {});
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const onSubmitPersonal = async (data) => {
    try {
      setLoading(true);
      const response = await apiService.updateProfile(data);
      updateUser(response.data.user);
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error('Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitPassword = async (data) => {
    try {
      setLoading(true);
      await apiService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      toast.success('Senha alterada com sucesso!');
      resetPassword();
      setShowPasswordForm(false);
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      toast.error('Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Imagem deve ter no máximo 5MB');
        return;
      }
      
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!profileImage) return;
    
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('profileImage', profileImage);
      
      const response = await apiService.updateProfileImage(formData);
      updateUser(response.data.user);
      toast.success('Foto de perfil atualizada!');
      setProfileImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Erro ao atualizar foto:', error);
      toast.error('Erro ao atualizar foto de perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleUpdateCategories = async () => {
    try {
      setLoading(true);
      const response = await apiService.updateProviderCategories({
        categoryIds: selectedCategories
      });
      updateUser(response.data.user);
      toast.success('Categorias atualizadas com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar categorias:', error);
      toast.error('Erro ao atualizar categorias');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <StarIcon key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <StarIcon key="half" className="w-4 h-4 fill-yellow-400/50 text-yellow-400" />
      );
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <StarIcon key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      );
    }
    
    return stars;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-8 mb-8">
        {/* Profile Image */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-base-200 flex items-center justify-center">
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
              ) : user?.profileImage ? (
                <img 
                  src={user.profileImage} 
                  alt={user.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon className="w-16 h-16 text-base-content/30" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 btn btn-circle btn-sm btn-primary cursor-pointer">
              <CameraIcon className="w-4 h-4" />
              <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          </div>
          
          {profileImage && (
            <div className="flex gap-2 mt-4">
              <button 
                className="btn btn-sm btn-success"
                onClick={handleImageUpload}
                disabled={loading}
              >
                {loading && <span className="loading loading-spinner loading-sm"></span>}
                <CheckIcon className="w-4 h-4" />
                Salvar
              </button>
              <button 
                className="btn btn-sm btn-ghost"
                onClick={() => {
                  setProfileImage(null);
                  setImagePreview(null);
                }}
              >
                <XMarkIcon className="w-4 h-4" />
                Cancelar
              </button>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-base-content mb-2">
            {user?.name} {user?.surname}
          </h1>
          <p className="text-lg text-base-content/70 mb-4">@{user?.username}</p>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="stat bg-base-200 rounded-lg p-4">
              <div className="stat-figure text-primary">
                <BriefcaseIcon className="w-8 h-8" />
              </div>
              <div className="stat-title text-xs">Trabalhos</div>
              <div className="stat-value text-lg">{stats.completedJobs}</div>
              <div className="stat-desc">concluídos</div>
            </div>
            
            <div className="stat bg-base-200 rounded-lg p-4">
              <div className="stat-figure text-success">
                <CurrencyDollarIcon className="w-8 h-8" />
              </div>
              <div className="stat-title text-xs">Ganhos</div>
              <div className="stat-value text-lg">{formatCurrency(stats.totalEarnings)}</div>
              <div className="stat-desc">total</div>
            </div>
            
            <div className="stat bg-base-200 rounded-lg p-4">
              <div className="stat-figure text-warning">
                <StarIcon className="w-8 h-8" />
              </div>
              <div className="stat-title text-xs">Avaliação</div>
              <div className="stat-value text-lg">{stats.averageRating?.toFixed(1) || '0.0'}</div>
              <div className="stat-desc">{stats.totalReviews} avaliações</div>
            </div>
            
            <div className="stat bg-base-200 rounded-lg p-4">
              <div className="stat-figure text-info">
                <ClockIcon className="w-8 h-8" />
              </div>
              <div className="stat-title text-xs">Em andamento</div>
              <div className="stat-value text-lg">{stats.activeJobs}</div>
              <div className="stat-desc">trabalhos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed mb-8">
        <button 
          className={`tab ${activeTab === 'personal' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('personal')}
        >
          Informações Pessoais
        </button>
        <button 
          className={`tab ${activeTab === 'categories' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          Categorias de Serviços
        </button>
        <button 
          className={`tab ${activeTab === 'security' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          Segurança
        </button>
      </div>

      {/* Personal Information Tab */}
      {activeTab === 'personal' && (
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title mb-6">Informações Pessoais</h2>
            
            <form onSubmit={handleSubmitPersonal(onSubmitPersonal)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Nome *</span>
                  </label>
                  <input
                    type="text"
                    className={`input input-bordered ${errorsPersonal.name ? 'input-error' : ''}`}
                    {...registerPersonal('name', { required: 'Nome é obrigatório' })}
                  />
                  {errorsPersonal.name && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errorsPersonal.name.message}</span>
                    </label>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Sobrenome *</span>
                  </label>
                  <input
                    type="text"
                    className={`input input-bordered ${errorsPersonal.surname ? 'input-error' : ''}`}
                    {...registerPersonal('surname', { required: 'Sobrenome é obrigatório' })}
                  />
                  {errorsPersonal.surname && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errorsPersonal.surname.message}</span>
                    </label>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Nome de usuário *</span>
                  </label>
                  <input
                    type="text"
                    className={`input input-bordered ${errorsPersonal.username ? 'input-error' : ''}`}
                    {...registerPersonal('username', { required: 'Nome de usuário é obrigatório' })}
                  />
                  {errorsPersonal.username && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errorsPersonal.username.message}</span>
                    </label>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">E-mail *</span>
                  </label>
                  <input
                    type="email"
                    className={`input input-bordered ${errorsPersonal.email ? 'input-error' : ''}`}
                    {...registerPersonal('email', { 
                      required: 'E-mail é obrigatório',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'E-mail inválido'
                      }
                    })}
                  />
                  {errorsPersonal.email && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errorsPersonal.email.message}</span>
                    </label>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Telefone</span>
                  </label>
                  <input
                    type="tel"
                    className="input input-bordered"
                    {...registerPersonal('phone')}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Cidade</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    {...registerPersonal('city')}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Estado</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    {...registerPersonal('state')}
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Endereço</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  rows="3"
                  {...registerPersonal('address')}
                ></textarea>
              </div>

              <div className="flex justify-end">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading && <span className="loading loading-spinner loading-sm"></span>}
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title mb-6">Categorias de Serviços</h2>
            <p className="text-base-content/70 mb-6">
              Selecione as categorias de serviços que você oferece. Isso ajudará os clientes a encontrarem você.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {categories.map((category) => (
                <div key={category.id} className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">{category.name}</span>
                    <input 
                      type="checkbox" 
                      className="checkbox checkbox-primary"
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => handleCategoryToggle(category.id)}
                    />
                  </label>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button 
                className="btn btn-primary"
                onClick={handleUpdateCategories}
                disabled={loading}
              >
                {loading && <span className="loading loading-spinner loading-sm"></span>}
                Salvar Categorias
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title mb-6">Segurança</h2>
            
            {!showPasswordForm ? (
              <div className="text-center py-8">
                <p className="text-base-content/70 mb-4">
                  Mantenha sua conta segura alterando sua senha regularmente.
                </p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowPasswordForm(true)}
                >
                  <PencilIcon className="w-4 h-4" />
                  Alterar Senha
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-6">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Senha Atual *</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className={`input input-bordered w-full pr-12 ${errorsPassword.currentPassword ? 'input-error' : ''}`}
                      {...registerPassword('currentPassword', { required: 'Senha atual é obrigatória' })}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-5 h-5 text-base-content/50" />
                      ) : (
                        <EyeIcon className="w-5 h-5 text-base-content/50" />
                      )}
                    </button>
                  </div>
                  {errorsPassword.currentPassword && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errorsPassword.currentPassword.message}</span>
                    </label>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Nova Senha *</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      className={`input input-bordered w-full pr-12 ${errorsPassword.newPassword ? 'input-error' : ''}`}
                      {...registerPassword('newPassword', { 
                        required: 'Nova senha é obrigatória',
                        minLength: {
                          value: 6,
                          message: 'Senha deve ter pelo menos 6 caracteres'
                        }
                      })}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeSlashIcon className="w-5 h-5 text-base-content/50" />
                      ) : (
                        <EyeIcon className="w-5 h-5 text-base-content/50" />
                      )}
                    </button>
                  </div>
                  {errorsPassword.newPassword && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errorsPassword.newPassword.message}</span>
                    </label>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Confirmar Nova Senha *</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className={`input input-bordered w-full pr-12 ${errorsPassword.confirmPassword ? 'input-error' : ''}`}
                      {...registerPassword('confirmPassword', { 
                        required: 'Confirmação de senha é obrigatória',
                        validate: value => value === newPassword || 'Senhas não coincidem'
                      })}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="w-5 h-5 text-base-content/50" />
                      ) : (
                        <EyeIcon className="w-5 h-5 text-base-content/50" />
                      )}
                    </button>
                  </div>
                  {errorsPassword.confirmPassword && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errorsPassword.confirmPassword.message}</span>
                    </label>
                  )}
                </div>

                <div className="flex gap-4 justify-end">
                  <button 
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => {
                      setShowPasswordForm(false);
                      resetPassword();
                    }}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading && <span className="loading loading-spinner loading-sm"></span>}
                    Alterar Senha
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div className="card bg-base-100 shadow-lg mt-8">
        <div className="card-body">
          <ReviewsList 
            userId={user?.id} 
            userType="provider" 
            showTitle={true}
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;