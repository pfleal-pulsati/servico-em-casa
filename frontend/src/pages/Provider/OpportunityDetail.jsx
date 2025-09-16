import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiService } from '../../services/api';
import {
  ArrowLeftIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserIcon,
  ClockIcon,
  PhotoIcon,
  PlusIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const OpportunityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [opportunity, setOpportunity] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    fetchOpportunityDetails();
  }, [id]);

  const fetchOpportunityDetails = async () => {
    try {
      setLoading(true);
      const [opportunityRes, proposalsRes] = await Promise.all([
        apiService.getServiceRequest(id),
        apiService.getServiceRequestProposals(id)
      ]);
      
      setOpportunity(opportunityRes.data);
      setProposals(proposalsRes.data.proposals || []);
    } catch (error) {
      console.error('Erro ao carregar detalhes da oportunidade:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'alta': return 'badge-error';
      case 'média': return 'badge-warning';
      case 'baixa': return 'badge-success';
      default: return 'badge-ghost';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'aberto': return 'badge-success';
      case 'em_andamento': return 'badge-warning';
      case 'concluido': return 'badge-info';
      case 'cancelado': return 'badge-error';
      default: return 'badge-ghost';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-base-content mb-4">
            Oportunidade não encontrada
          </h2>
          <button 
            onClick={() => navigate('/provider/opportunities')}
            className="btn btn-primary"
          >
            Voltar às oportunidades
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/provider/opportunities')}
          className="btn btn-ghost btn-circle"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-base-content mb-2">
            {opportunity.title}
          </h1>
          <div className="flex items-center gap-4">
            <div className={`badge ${getPriorityColor(opportunity.priority)}`}>
              {opportunity.priority}
            </div>
            <div className={`badge ${getStatusColor(opportunity.status)}`}>
              {opportunity.status === 'aberto' ? 'Aberto' :
               opportunity.status === 'em_andamento' ? 'Em andamento' :
               opportunity.status === 'concluido' ? 'Concluído' :
               opportunity.status === 'cancelado' ? 'Cancelado' : opportunity.status}
            </div>
            {opportunity.category && (
              <div className="badge badge-outline">
                {opportunity.category.name}
              </div>
            )}
          </div>
        </div>
        <Link 
          to={`/provider/opportunities/${id}/proposal`}
          className="btn btn-primary"
          disabled={opportunity.status !== 'aberto'}
        >
          <PlusIcon className="w-5 h-5" />
          Enviar Proposta
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title text-xl mb-4">Descrição do Serviço</h2>
              <div className="prose max-w-none">
                <p className="text-base-content whitespace-pre-wrap">
                  {opportunity.description}
                </p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {opportunity.additionalInfo && (
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-xl mb-4">Informações Adicionais</h2>
                <div className="prose max-w-none">
                  <p className="text-base-content whitespace-pre-wrap">
                    {opportunity.additionalInfo}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Images */}
          {opportunity.images && opportunity.images.length > 0 && (
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-xl mb-4">Imagens</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {opportunity.images.map((image, index) => (
                    <div 
                      key={index}
                      className="aspect-square bg-base-200 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => openImageModal(image.url)}
                    >
                      <img 
                        src={image.url} 
                        alt={`Imagem ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Proposals */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title text-xl mb-4">
                Propostas Recebidas ({proposals.length})
              </h2>
              
              {proposals.length === 0 ? (
                <div className="text-center py-8">
                  <PlusIcon className="w-12 h-12 mx-auto text-base-content/30 mb-4" />
                  <p className="text-base-content/70">
                    Nenhuma proposta enviada ainda
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {proposals.map((proposal) => (
                    <div key={proposal.id} className="border border-base-300 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="avatar">
                            <div className="w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
                              {proposal.provider?.name?.charAt(0) || 'P'}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold">{proposal.provider?.name}</h4>
                            <div className="flex items-center gap-2 text-sm text-base-content/70">
                              <StarIcon className="w-4 h-4" />
                              <span>{proposal.provider?.averageRating?.toFixed(1) || '0.0'}</span>
                              <span>({proposal.provider?.totalReviews || 0} avaliações)</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-success">
                            R$ {proposal.budget?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                          <div className="text-sm text-base-content/70">
                            {proposal.estimatedDays} dias
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-base-content/80 mb-3">
                        {proposal.description}
                      </p>
                      
                      <div className="flex justify-between items-center text-sm text-base-content/70">
                        <span>Enviada em {formatDateTime(proposal.createdAt)}</span>
                        <div className={`badge ${
                          proposal.status === 'accepted' ? 'badge-success' :
                          proposal.status === 'rejected' ? 'badge-error' :
                          'badge-warning'
                        }`}>
                          {proposal.status === 'pending' ? 'Pendente' :
                           proposal.status === 'accepted' ? 'Aceita' : 'Rejeitada'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Info */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="card-title text-lg mb-4">Cliente</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="avatar">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-content flex items-center justify-center">
                    {opportunity.client?.name?.charAt(0) || 'C'}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold">{opportunity.client?.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-base-content/70">
                    <StarIcon className="w-4 h-4" />
                    <span>{opportunity.client?.averageRating?.toFixed(1) || '0.0'}</span>
                  </div>
                </div>
              </div>
              <div className="text-sm text-base-content/70">
                <p>Membro desde {formatDate(opportunity.client?.createdAt)}</p>
                <p>{opportunity.client?.totalRequests || 0} solicitações feitas</p>
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="card-title text-lg mb-4">Detalhes do Projeto</h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CurrencyDollarIcon className="w-5 h-5 text-success" />
                  <div>
                    <div className="font-semibold text-success">
                      R$ {opportunity.budget?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-sm text-base-content/70">Orçamento</div>
                  </div>
                </div>

                {opportunity.preferredDate && (
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="w-5 h-5 text-warning" />
                    <div>
                      <div className="font-semibold">
                        {formatDate(opportunity.preferredDate)}
                      </div>
                      <div className="text-sm text-base-content/70">Data preferida</div>
                    </div>
                  </div>
                )}

                {opportunity.address && (
                  <div className="flex items-start gap-3">
                    <MapPinIcon className="w-5 h-5 text-info mt-1" />
                    <div>
                      <div className="font-semibold">
                        {opportunity.address.city}, {opportunity.address.state}
                      </div>
                      <div className="text-sm text-base-content/70">
                        {opportunity.address.street}, {opportunity.address.number}
                        {opportunity.address.complement && `, ${opportunity.address.complement}`}
                        <br />
                        CEP: {opportunity.address.zipCode}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <ClockIcon className="w-5 h-5 text-base-content/50" />
                  <div>
                    <div className="font-semibold">
                      {formatDateTime(opportunity.createdAt)}
                    </div>
                    <div className="text-sm text-base-content/70">Publicado em</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          {opportunity.status === 'aberto' && (
            <Link 
              to={`/provider/opportunities/${id}/proposal`}
              className="btn btn-primary btn-block btn-lg"
            >
              <PlusIcon className="w-5 h-5" />
              Enviar Proposta
            </Link>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl">
            <button 
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => setShowImageModal(false)}
            >
              ✕
            </button>
            <img 
              src={selectedImage} 
              alt="Imagem ampliada"
              className="w-full h-auto"
            />
          </div>
          <div className="modal-backdrop" onClick={() => setShowImageModal(false)}></div>
        </div>
      )}
    </div>
  );
};

export default OpportunityDetail;