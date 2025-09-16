import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../../services/api';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Proposals = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [proposalToDelete, setProposalToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProposals();
  }, [filters, pagination.page]);

  const fetchProposals = async () => {
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
      
      const response = await apiService.getMyProposals(params);
      setProposals(response.data.proposals || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.total || 0,
        totalPages: response.data.totalPages || 0
      }));
    } catch (error) {
      console.error('Erro ao carregar propostas:', error);
      toast.error('Erro ao carregar propostas');
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
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleDeleteProposal = async () => {
    if (!proposalToDelete) return;
    
    try {
      setDeleting(true);
      await apiService.deleteProposal(proposalToDelete.id);
      toast.success('Proposta excluída com sucesso!');
      setShowDeleteModal(false);
      setProposalToDelete(null);
      fetchProposals();
    } catch (error) {
      console.error('Erro ao excluir proposta:', error);
      toast.error('Erro ao excluir proposta');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'badge-warning';
      case 'accepted': return 'badge-success';
      case 'rejected': return 'badge-error';
      default: return 'badge-ghost';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'Pendente';
      case 'accepted': return 'Aceita';
      case 'rejected': return 'Rejeitada';
      default: return status;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const canEditProposal = (proposal) => {
    return proposal.status === 'pending';
  };

  const canDeleteProposal = (proposal) => {
    return proposal.status === 'pending' || proposal.status === 'rejected';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-base-content mb-2">
            Minhas Propostas
          </h1>
          <p className="text-base-content/70">
            Gerencie todas as suas propostas enviadas
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">
            {pagination.total}
          </div>
          <div className="text-sm text-base-content/70">
            propostas enviadas
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
                  placeholder="Buscar propostas..."
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
                <option value="pending">Pendente</option>
                <option value="accepted">Aceita</option>
                <option value="rejected">Rejeitada</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="form-control">
              <select 
                className="select select-bordered"
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <option value="createdAt">Data de envio</option>
                <option value="budget">Valor</option>
                <option value="estimatedDays">Prazo</option>
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

      {/* Proposals List */}
      {!loading && (
        <div className="space-y-4 mb-8">
          {proposals.map((proposal) => (
            <div key={proposal.id} className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
              <div className="card-body">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Main Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-base-content mb-1">
                          {proposal.serviceRequest?.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-base-content/70">
                          <span>Cliente: {proposal.serviceRequest?.client?.name}</span>
                          <span>•</span>
                          <span>Enviada em {formatDateTime(proposal.createdAt)}</span>
                        </div>
                      </div>
                      <div className={`badge ${getStatusColor(proposal.status)}`}>
                        {getStatusText(proposal.status)}
                      </div>
                    </div>
                    
                    <p className="text-base-content/80 text-sm mb-3 line-clamp-2">
                      {proposal.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <CurrencyDollarIcon className="w-4 h-4 text-success" />
                        <span className="font-semibold text-success">
                          R$ {proposal.budget?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4 text-info" />
                        <span>{proposal.estimatedDays} dias</span>
                      </div>
                      
                      {proposal.serviceRequest?.category && (
                        <div className="badge badge-outline badge-sm">
                          {proposal.serviceRequest.category.name}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Link 
                      to={`/provider/opportunities/${proposal.serviceRequestId}`}
                      className="btn btn-sm btn-ghost"
                    >
                      <EyeIcon className="w-4 h-4" />
                      Ver oportunidade
                    </Link>
                    
                    {canEditProposal(proposal) && (
                      <Link 
                        to={`/provider/opportunities/${proposal.serviceRequestId}/proposal`}
                        className="btn btn-sm btn-primary"
                      >
                        <PencilIcon className="w-4 h-4" />
                        Editar
                      </Link>
                    )}
                    
                    {canDeleteProposal(proposal) && (
                      <button 
                        className="btn btn-sm btn-error"
                        onClick={() => {
                          setProposalToDelete(proposal);
                          setShowDeleteModal(true);
                        }}
                      >
                        <TrashIcon className="w-4 h-4" />
                        Excluir
                      </button>
                    )}
                  </div>
                </div>

                {/* Additional Info for Accepted/Rejected */}
                {proposal.status !== 'pending' && (
                  <div className="mt-4 pt-4 border-t border-base-300">
                    <div className="flex items-center gap-2 text-sm">
                      {proposal.status === 'accepted' ? (
                        <>
                          <CheckIcon className="w-4 h-4 text-success" />
                          <span className="text-success font-semibold">Proposta aceita!</span>
                        </>
                      ) : (
                        <>
                          <XMarkIcon className="w-4 h-4 text-error" />
                          <span className="text-error font-semibold">Proposta rejeitada</span>
                        </>
                      )}
                      {proposal.responseDate && (
                        <span className="text-base-content/70">
                          em {formatDateTime(proposal.responseDate)}
                        </span>
                      )}
                    </div>
                    
                    {proposal.responseMessage && (
                      <p className="text-sm text-base-content/70 mt-2">
                        Mensagem: {proposal.responseMessage}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && proposals.length === 0 && (
        <div className="text-center py-12">
          <ClockIcon className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
          <h3 className="text-xl font-semibold text-base-content mb-2">
            Nenhuma proposta encontrada
          </h3>
          <p className="text-base-content/70 mb-4">
            Você ainda não enviou nenhuma proposta ou nenhuma corresponde aos filtros aplicados.
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
      {!loading && proposals.length > 0 && pagination.totalPages > 1 && (
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Confirmar Exclusão</h3>
            <p className="mb-4">
              Tem certeza que deseja excluir esta proposta?
            </p>
            {proposalToDelete && (
              <div className="bg-base-200 p-4 rounded-lg mb-4">
                <h4 className="font-semibold">{proposalToDelete.serviceRequest?.title}</h4>
                <p className="text-sm text-base-content/70">
                  Valor: R$ {proposalToDelete.budget?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            )}
            <p className="text-sm text-base-content/70 mb-6">
              Esta ação não pode ser desfeita.
            </p>
            <div className="modal-action">
              <button 
                className="btn btn-ghost"
                onClick={() => {
                  setShowDeleteModal(false);
                  setProposalToDelete(null);
                }}
                disabled={deleting}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-error"
                onClick={handleDeleteProposal}
                disabled={deleting}
              >
                {deleting && <span className="loading loading-spinner loading-sm"></span>}
                Excluir
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => {
            if (!deleting) {
              setShowDeleteModal(false);
              setProposalToDelete(null);
            }
          }}></div>
        </div>
      )}
    </div>
  );
};

export default Proposals;