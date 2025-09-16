import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../../services/api';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  CheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  MapPinIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import ReviewModal from '../../components/ReviewModal';
import toast from 'react-hot-toast';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    sortBy: 'startDate',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [jobToComplete, setJobToComplete] = useState(null);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, [filters, pagination.page]);

  const fetchJobs = async () => {
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
      
      const response = await apiService.getMyJobs(params);
      setJobs(response.data.jobs || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.total || 0,
        totalPages: response.data.totalPages || 0
      }));
    } catch (error) {
      console.error('Erro ao carregar trabalhos:', error);
      toast.error('Erro ao carregar trabalhos');
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
      status: '',
      sortBy: 'startDate',
      sortOrder: 'desc'
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleCompleteJob = async () => {
    if (!jobToComplete) return;
    
    try {
      setCompleting(true);
      await apiService.completeJob(jobToComplete.id);
      toast.success('Trabalho marcado como concluído!');
      setShowCompleteModal(false);
      setJobToComplete(null);
      fetchJobs();
    } catch (error) {
      console.error('Erro ao concluir trabalho:', error);
      toast.error('Erro ao concluir trabalho');
    } finally {
      setCompleting(false);
    }
  };

  const handleReviewClient = (job) => {
    setJobToComplete(job);
    setShowReviewModal(true);
  };

  const handleReviewSuccess = () => {
    fetchJobs();
    setShowReviewModal(false);
    setJobToComplete(null);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'in_progress': return 'badge-info';
      case 'completed': return 'badge-success';
      case 'cancelled': return 'badge-error';
      default: return 'badge-ghost';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'in_progress': return 'Em andamento';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const canCompleteJob = (job) => {
    return job.status === 'in_progress';
  };

  const getDaysRemaining = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-base-content mb-2">
            Meus Trabalhos
          </h1>
          <p className="text-base-content/70">
            Gerencie seus trabalhos aceitos e em andamento
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">
            {pagination.total}
          </div>
          <div className="text-sm text-base-content/70">
            trabalhos
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card bg-base-100 shadow-lg mb-8">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="form-control">
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Buscar trabalhos..."
                  className="input input-bordered flex-1"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
                <button className="btn btn-square btn-primary">
                  <MagnifyingGlassIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Status Filter */}
            <div className="form-control">
              <select 
                className="select select-bordered"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">Todos os status</option>
                <option value="in_progress">Em andamento</option>
                <option value="completed">Concluído</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="form-control">
              <select 
                className="select select-bordered"
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <option value="startDate">Data de início</option>
                <option value="endDate">Data de conclusão</option>
                <option value="budget">Valor</option>
              </select>
            </div>

            {/* Sort Order */}
            <div className="form-control">
              <select 
                className="select select-bordered"
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
              >
                <option value="desc">Mais recente</option>
                <option value="asc">Mais antigo</option>
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          <div className="flex justify-end mt-4">
            <button 
              className="btn btn-ghost btn-sm"
              onClick={clearFilters}
            >
              Limpar filtros
            </button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      )}

      {/* Jobs List */}
      {!loading && (
        <div className="space-y-6 mb-8">
          {jobs.map((job) => {
            const daysRemaining = job.endDate ? getDaysRemaining(job.endDate) : null;
            
            return (
              <div key={job.id} className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
                <div className="card-body">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Main Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-base-content mb-2">
                            {job.serviceRequest?.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-base-content/70 mb-2">
                            <span>Iniciado em {formatDate(job.startDate)}</span>
                            {job.endDate && (
                              <>
                                <span>•</span>
                                <span>Prazo: {formatDate(job.endDate)}</span>
                              </>
                            )}
                          </div>
                          {daysRemaining !== null && job.status === 'in_progress' && (
                            <div className={`text-sm ${
                              daysRemaining < 0 ? 'text-error' : 
                              daysRemaining <= 3 ? 'text-warning' : 'text-info'
                            }`}>
                              {daysRemaining < 0 
                                ? `Atrasado há ${Math.abs(daysRemaining)} dias`
                                : daysRemaining === 0
                                ? 'Vence hoje'
                                : `${daysRemaining} dias restantes`
                              }
                            </div>
                          )}
                        </div>
                        <div className={`badge ${getStatusColor(job.status)} badge-lg`}>
                          {getStatusText(job.status)}
                        </div>
                      </div>
                      
                      <p className="text-base-content/80 mb-4">
                        {job.serviceRequest?.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-4 text-sm mb-4">
                        <div className="flex items-center gap-1">
                          <CurrencyDollarIcon className="w-4 h-4 text-success" />
                          <span className="font-semibold text-success">
                            R$ {job.budget?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        
                        {job.serviceRequest?.category && (
                          <div className="badge badge-outline">
                            {job.serviceRequest.category.name}
                          </div>
                        )}
                        
                        {job.serviceRequest?.priority && (
                          <div className={`badge ${
                            job.serviceRequest.priority === 'high' ? 'badge-error' :
                            job.serviceRequest.priority === 'medium' ? 'badge-warning' :
                            'badge-info'
                          }`}>
                            {job.serviceRequest.priority === 'high' ? 'Alta' :
                             job.serviceRequest.priority === 'medium' ? 'Média' : 'Baixa'}
                          </div>
                        )}
                      </div>

                      {/* Address */}
                      {job.serviceRequest?.address && (
                        <div className="flex items-start gap-2 text-sm text-base-content/70 mb-4">
                          <MapPinIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>
                            {job.serviceRequest.address}, {job.serviceRequest.city} - {job.serviceRequest.state}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Client Info & Actions */}
                    <div className="lg:w-80">
                      {/* Client Info */}
                      <div className="card bg-base-200 mb-4">
                        <div className="card-body p-4">
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <UserIcon className="w-4 h-4" />
                            Informações do Cliente
                          </h4>
                          
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium">{job.serviceRequest?.client?.name}</span>
                            </div>
                            
                            {job.serviceRequest?.client?.email && (
                              <div className="flex items-center gap-2">
                                <EnvelopeIcon className="w-4 h-4 text-base-content/50" />
                                <span>{job.serviceRequest.client.email}</span>
                              </div>
                            )}
                            
                            {job.serviceRequest?.client?.phone && (
                              <div className="flex items-center gap-2">
                                <PhoneIcon className="w-4 h-4 text-base-content/50" />
                                <span>{job.serviceRequest.client.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="space-y-2">
                        <Link 
                          to={`/provider/opportunities/${job.serviceRequestId}`}
                          className="btn btn-outline btn-sm w-full"
                        >
                          <EyeIcon className="w-4 h-4" />
                          Ver detalhes
                        </Link>
                        
                        <button className="btn btn-ghost btn-sm w-full">
                          <ChatBubbleLeftRightIcon className="w-4 h-4" />
                          Conversar com cliente
                        </button>
                        
                        {canCompleteJob(job) && (
                          <button 
                            className="btn btn-success btn-sm w-full"
                            onClick={() => {
                              setJobToComplete(job);
                              setShowCompleteModal(true);
                            }}
                          >
                            <CheckIcon className="w-4 h-4" />
                            Marcar como concluído
                          </button>
                        )}
                        
                        {job.status === 'completed' && !job.clientReview && (
                          <button 
                            className="btn btn-warning btn-sm w-full"
                            onClick={() => handleReviewClient(job)}
                          >
                            <StarIcon className="w-4 h-4" />
                            Avaliar cliente
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress Info for In Progress Jobs */}
                  {job.status === 'in_progress' && (
                    <div className="mt-6 pt-4 border-t border-base-300">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-base-content/70">Progresso do trabalho</span>
                        <span className="font-medium">Em andamento</span>
                      </div>
                      <div className="mt-2">
                        <progress className="progress progress-primary w-full" value="50" max="100"></progress>
                      </div>
                    </div>
                  )}

                  {/* Completion Info */}
                  {job.status === 'completed' && job.completedAt && (
                    <div className="mt-4 pt-4 border-t border-base-300">
                      <div className="flex items-center gap-2 text-sm text-success">
                        <CheckIcon className="w-4 h-4" />
                        <span className="font-semibold">Trabalho concluído em {formatDateTime(job.completedAt)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && jobs.length === 0 && (
        <div className="text-center py-12">
          <ClockIcon className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
          <h3 className="text-xl font-semibold text-base-content mb-2">
            Nenhum trabalho encontrado
          </h3>
          <p className="text-base-content/70 mb-4">
            Você ainda não tem trabalhos aceitos ou nenhum corresponde aos filtros aplicados.
          </p>
          <div className="flex gap-4 justify-center">
            <button 
              className="btn btn-ghost"
              onClick={clearFilters}
            >
              Limpar filtros
            </button>
            <Link 
              to="/provider/opportunities"
              className="btn btn-primary"
            >
              Ver oportunidades
            </Link>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && jobs.length > 0 && pagination.totalPages > 1 && (
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

      {/* Complete Job Confirmation Modal */}
      {showCompleteModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Confirmar Conclusão</h3>
            <p className="mb-4">
              Tem certeza que deseja marcar este trabalho como concluído?
            </p>
            {jobToComplete && (
              <div className="bg-base-200 p-4 rounded-lg mb-4">
                <h4 className="font-semibold">{jobToComplete.serviceRequest?.title}</h4>
                <p className="text-sm text-base-content/70">
                  Cliente: {jobToComplete.serviceRequest?.client?.name}
                </p>
                <p className="text-sm text-base-content/70">
                  Valor: R$ {jobToComplete.budget?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            )}
            <p className="text-sm text-base-content/70 mb-6">
              Após marcar como concluído, o cliente poderá avaliar seu trabalho.
            </p>
            <div className="modal-action">
              <button 
                className="btn btn-ghost"
                onClick={() => {
                  setShowCompleteModal(false);
                  setJobToComplete(null);
                }}
                disabled={completing}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-success"
                onClick={handleCompleteJob}
                disabled={completing}
              >
                {completing && <span className="loading loading-spinner loading-sm"></span>}
                Confirmar conclusão
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => {
            if (!completing) {
              setShowCompleteModal(false);
              setJobToComplete(null);
            }
          }}></div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && jobToComplete && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            setJobToComplete(null);
          }}
          targetType="client"
          targetId={jobToComplete.serviceRequest?.client?.id}
          jobId={jobToComplete.id}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
};

export default Jobs;