import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../../services/api';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  EyeIcon,
  PlusIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const Opportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    priority: '',
    minBudget: '',
    maxBudget: '',
    city: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchOpportunities();
  }, [filters, pagination.page]);

  const fetchCategories = async () => {
    try {
      const response = await apiService.getCategories();
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });
      
      const response = await apiService.getOpportunities(params);
      setOpportunities(response.data.requests || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.total || 0,
        totalPages: response.data.totalPages || 0
      }));
    } catch (error) {
      console.error('Erro ao carregar oportunidades:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      priority: '',
      minBudget: '',
      maxBudget: '',
      city: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'alta': return 'badge-error';
      case 'média': return 'badge-warning';
      case 'baixa': return 'badge-success';
      default: return 'badge-ghost';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-base-content mb-2">
            Oportunidades de Trabalho
          </h1>
          <p className="text-base-content/70">
            Encontre trabalhos que combinam com suas habilidades
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">
            {pagination.total}
          </div>
          <div className="text-sm text-base-content/70">
            oportunidades disponíveis
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card bg-base-100 shadow-lg mb-8">
        <div className="card-body">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="form-control">
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Buscar oportunidades..."
                    className="input input-bordered flex-1"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                  <button className="btn btn-square btn-primary">
                    <MagnifyingGlassIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Filter Toggle */}
            <button 
              className="btn btn-outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FunnelIcon className="w-5 h-5" />
              Filtros
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="divider"></div>
          )}
          
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Category */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Categoria</span>
                </label>
                <select 
                  className="select select-bordered"
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <option value="">Todas as categorias</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Prioridade</span>
                </label>
                <select 
                  className="select select-bordered"
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                >
                  <option value="">Todas as prioridades</option>
                  <option value="alta">Alta</option>
                  <option value="média">Média</option>
                  <option value="baixa">Baixa</option>
                </select>
              </div>

              {/* City */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Cidade</span>
                </label>
                <input
                  type="text"
                  placeholder="Digite a cidade"
                  className="input input-bordered"
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                />
              </div>

              {/* Min Budget */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Orçamento mínimo</span>
                </label>
                <input
                  type="number"
                  placeholder="R$ 0,00"
                  className="input input-bordered"
                  value={filters.minBudget}
                  onChange={(e) => handleFilterChange('minBudget', e.target.value)}
                />
              </div>

              {/* Max Budget */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Orçamento máximo</span>
                </label>
                <input
                  type="number"
                  placeholder="R$ 0,00"
                  className="input input-bordered"
                  value={filters.maxBudget}
                  onChange={(e) => handleFilterChange('maxBudget', e.target.value)}
                />
              </div>

              {/* Clear Filters */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">&nbsp;</span>
                </label>
                <button 
                  className="btn btn-ghost"
                  onClick={clearFilters}
                >
                  Limpar filtros
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      )}

      {/* Opportunities Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {opportunities.map((opportunity) => (
            <div key={opportunity.id} className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
              <div className="card-body">
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <h3 className="card-title text-lg line-clamp-2">
                    {opportunity.title}
                  </h3>
                  <div className={`badge ${getPriorityColor(opportunity.priority)}`}>
                    {opportunity.priority}
                  </div>
                </div>

                {/* Description */}
                <p className="text-base-content/70 text-sm mb-4 line-clamp-3">
                  {opportunity.description}
                </p>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <CurrencyDollarIcon className="w-4 h-4 text-success" />
                    <span className="font-semibold text-success">
                      R$ {opportunity.budget?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  
                  {opportunity.preferredDate && (
                    <div className="flex items-center gap-2 text-sm text-base-content/70">
                      <CalendarIcon className="w-4 h-4" />
                      <span>Prazo: {formatDate(opportunity.preferredDate)}</span>
                    </div>
                  )}
                  
                  {opportunity.address && (
                    <div className="flex items-center gap-2 text-sm text-base-content/70">
                      <MapPinIcon className="w-4 h-4" />
                      <span>{opportunity.address.city}, {opportunity.address.state}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm text-base-content/70">
                    <ClockIcon className="w-4 h-4" />
                    <span>Publicado em {formatDate(opportunity.createdAt)}</span>
                  </div>
                </div>

                {/* Category */}
                {opportunity.category && (
                  <div className="mb-4">
                    <div className="badge badge-outline">
                      {opportunity.category.name}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="card-actions justify-end">
                  <Link 
                    to={`/provider/opportunities/${opportunity.id}`}
                    className="btn btn-sm btn-ghost"
                  >
                    <EyeIcon className="w-4 h-4" />
                    Ver detalhes
                  </Link>
                  <Link 
                    to={`/provider/opportunities/${opportunity.id}/proposal`}
                    className="btn btn-sm btn-primary"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Enviar proposta
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && opportunities.length === 0 && (
        <div className="text-center py-12">
          <ClockIcon className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
          <h3 className="text-xl font-semibold text-base-content mb-2">
            Nenhuma oportunidade encontrada
          </h3>
          <p className="text-base-content/70 mb-4">
            Tente ajustar os filtros ou verificar novamente mais tarde.
          </p>
          <button 
            className="btn btn-primary"
            onClick={clearFilters}
          >
            Limpar filtros
          </button>
        </div>
      )}

      {/* Pagination */}
      {!loading && opportunities.length > 0 && pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <div className="join">
            <button 
              className="join-item btn"
              disabled={pagination.page === 1}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              «
            </button>
            
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`join-item btn ${
                  page === pagination.page ? 'btn-active' : ''
                }`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
            
            <button 
              className="join-item btn"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Opportunities;