import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { UserIcon, StarIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import Layout from '../components/Layout';

const Providers = () => {
  const [providers, setProviders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    city: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const response = await apiService.categories.getAll();
      setCategories(response.results || response);
    } catch (err) {
      console.error('Erro ao buscar categorias:', err);
    }
  };

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.city) params.city = filters.city;
      
      const response = await apiService.providers.getAll(params);
      setProviders(response.results || response);
    } catch (err) {
      setError('Erro ao carregar prestadores');
      console.error('Erro ao buscar prestadores:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <StarIconSolid key={i} className="h-4 w-4 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <StarIcon key="half" className="h-4 w-4 text-yellow-400" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <StarIcon key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
      );
    }

    return stars;
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-base-200">
        <div className="container mx-auto px-4 py-8">
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-base-200">
        <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-base-content mb-2">
            Prestadores de Serviço
          </h1>
          <p className="text-base-content/70">
            Encontre profissionais qualificados para seus projetos
          </p>
        </div>

        {/* Filters */}
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body">
            <h2 className="card-title mb-4">Filtros</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Categoria</span>
                </label>
                <select 
                  className="select select-bordered w-full"
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <option value="">Todas as categorias</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Cidade</span>
                </label>
                <input 
                  type="text" 
                  placeholder="Digite a cidade" 
                  className="input input-bordered w-full"
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                />
              </div>
            </div>
            
            <div className="card-actions justify-end mt-4">
              <button 
                className="btn btn-outline"
                onClick={() => setFilters({ category: '', city: '' })}
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-base-content/70">
            {providers.length} prestador(es) encontrado(s)
          </p>
        </div>

        {/* Providers Grid */}
        {providers.length === 0 ? (
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body text-center">
              <UserIcon className="h-16 w-16 mx-auto text-base-content/30 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum prestador encontrado</h3>
              <p className="text-base-content/70">
                Tente ajustar os filtros ou remover algumas restrições.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((provider) => (
              <div key={provider.id} className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
                <div className="card-body">
                  {/* Provider Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="avatar">
                      <div className="w-12 h-12 rounded-full">
                        {provider.user?.profile_picture ? (
                          <img
                            src={provider.user.profile_picture}
                            alt={`${provider.user.first_name} ${provider.user.last_name}`}
                          />
                        ) : (
                          <div className="bg-primary text-primary-content flex items-center justify-center">
                            <UserIcon className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {provider.user?.first_name} {provider.user?.last_name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {renderStars(provider.rating || 0)}
                        </div>
                        <span className="text-sm text-base-content/70">
                          ({provider.total_jobs || 0})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  {provider.bio && (
                    <p className="text-sm text-base-content/70 mb-4 line-clamp-3">
                      {provider.bio}
                    </p>
                  )}

                  {/* Categories */}
                  {provider.service_categories && provider.service_categories.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {provider.service_categories.map((category) => (
                          <span 
                            key={category.id} 
                            className="badge badge-primary badge-sm"
                          >
                            {category.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    {provider.user?.phone_number && (
                      <div className="flex items-center gap-2 text-sm">
                        <PhoneIcon className="h-4 w-4 text-base-content/50" />
                        <span>{provider.user.phone_number}</span>
                      </div>
                    )}
                    
                    {provider.user?.city && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPinIcon className="h-4 w-4 text-base-content/50" />
                        <span>{provider.user.city}, {provider.user?.state || 'SC'}</span>
                      </div>
                    )}
                  </div>

                  {/* Pricing */}
                  {provider.hourly_rate && (
                    <div className="mb-4">
                      <p className="text-sm text-base-content/70">Valor por hora:</p>
                      <p className="text-lg font-semibold text-primary">
                        R$ {provider.hourly_rate}
                      </p>
                    </div>
                  )}

                  {/* Experience */}
                  {provider.experience_years && (
                    <div className="mb-4">
                      <p className="text-sm text-base-content/70">
                        {provider.experience_years} anos de experiência
                      </p>
                    </div>
                  )}

                  {/* Availability */}
                  <div className="mb-4">
                    <span className={`badge ${
                      provider.is_available ? 'badge-success' : 'badge-error'
                    }`}>
                      {provider.is_available ? 'Disponível' : 'Indisponível'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="card-actions justify-end">
                    <button className="btn btn-primary btn-sm">
                      Ver Perfil
                    </button>
                    <button className="btn btn-outline btn-sm">
                      Contratar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </Layout>
  );
};

export default Providers;