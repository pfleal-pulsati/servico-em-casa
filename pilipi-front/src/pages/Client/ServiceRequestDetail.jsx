import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { apiService } from '../../services/api'
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ClockIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  CalendarIcon,
  UserIcon,
  StarIcon,
  CheckIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import ReviewModal from '../../components/ReviewModal'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const ServiceRequestDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [request, setRequest] = useState(null)
  const [proposals, setProposals] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedProposal, setSelectedProposal] = useState(null)
  const [showProposalModal, setShowProposalModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)

  useEffect(() => {
    fetchRequestDetail()
    fetchProposals()
  }, [id])

  const fetchRequestDetail = async () => {
    try {
      const response = await apiService.serviceRequests.getById(id)
      setRequest(response)
    } catch (error) {
      console.error('Erro ao carregar solicitação:', error)
      toast.error('Erro ao carregar solicitação')
      navigate('/requests')
    }
  }

  const fetchProposals = async () => {
    try {
      const response = await apiService.assignments.getAll({ service_request: id })
      setProposals(response || [])
    } catch (error) {
      console.error('Erro ao carregar propostas:', error)
      setProposals([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteRequest = async () => {
    try {
      await apiService.serviceRequests.delete(id)
      toast.success('Solicitação excluída com sucesso!')
      navigate('/requests')
    } catch (error) {
      console.error('Erro ao excluir solicitação:', error)
      toast.error('Erro ao excluir solicitação')
    }
    setShowDeleteModal(false)
  }

  const handleAcceptProposal = async (proposalId) => {
    try {
      await apiService.assignments.update(proposalId, {
        status: 'accepted'
      })
      toast.success('Proposta aceita com sucesso!')
      fetchProposals()
      fetchRequestDetail()
    } catch (error) {
      console.error('Erro ao aceitar proposta:', error)
      toast.error('Erro ao aceitar proposta')
    }
  }

  const handleRejectProposal = async (proposalId) => {
    try {
      await apiService.assignments.update(proposalId, {
        status: 'rejected'
      })
      toast.success('Proposta rejeitada')
      fetchProposals()
    } catch (error) {
      console.error('Erro ao rejeitar proposta:', error)
      toast.error('Erro ao rejeitar proposta')
    }
  }

  const handleReviewProvider = (job) => {
    setSelectedJob(job)
    setShowReviewModal(true)
  }

  const handleReviewSuccess = () => {
    fetchRequestDetail()
    setShowReviewModal(false)
    setSelectedJob(null)
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'badge-warning', text: 'Pendente' },
      in_progress: { class: 'badge-info', text: 'Em Andamento' },
      completed: { class: 'badge-success', text: 'Concluído' },
      cancelled: { class: 'badge-error', text: 'Cancelado' }
    }
    const config = statusConfig[status] || { class: 'badge-ghost', text: status }
    return <span className={`badge ${config.class}`}>{config.text}</span>
  }

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: { class: 'badge-ghost', text: 'Baixa' },
      medium: { class: 'badge-warning', text: 'Média' },
      high: { class: 'badge-error', text: 'Alta' },
      urgent: { class: 'badge-error badge-outline', text: 'Urgente' }
    }
    const config = priorityConfig[priority] || { class: 'badge-ghost', text: priority }
    return <span className={`badge ${config.class}`}>{config.text}</span>
  }

  const getProposalStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'badge-warning', text: 'Pendente' },
      accepted: { class: 'badge-success', text: 'Aceita' },
      rejected: { class: 'badge-error', text: 'Rejeitada' },
      completed: { class: 'badge-info', text: 'Concluída' }
    }
    const config = statusConfig[status] || { class: 'badge-ghost', text: status }
    return <span className={`badge ${config.class}`}>{config.text}</span>
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <StarIcon
        key={index}
        className={`h-4 w-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Solicitação não encontrada</h2>
          <Link to="/requests" className="btn btn-primary">
            Voltar para Solicitações
          </Link>
        </div>
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
            <li><Link to="/requests">Solicitações</Link></li>
            <li>#{request?.id}</li>
          </ul>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request Details */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    <h1 className="text-2xl font-bold mb-2">{request.title}</h1>
                    <div className="flex flex-wrap items-center gap-2">
                      {getStatusBadge(request.status)}
                      {getPriorityBadge(request.priority)}
                      <span className="badge badge-outline">{request.category_name}</span>
                    </div>
                  </div>
                  
                  {request.status === 'pending' && (
                    <div className="flex gap-2">
                      <Link
                        to={`/requests/${id}/edit`}
                        className="btn btn-outline btn-sm gap-2"
                      >
                        <PencilIcon className="h-4 w-4" />
                        Editar
                      </Link>
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="btn btn-error btn-outline btn-sm gap-2"
                      >
                        <TrashIcon className="h-4 w-4" />
                        Excluir
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <CurrencyDollarIcon className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-base-content/70">Orçamento</p>
                        <p className="font-semibold">
                          R$ {parseFloat(request.budget_min).toFixed(2)} - R$ {parseFloat(request.budget_max).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-base-content/70">Data de Criação</p>
                        <p className="font-semibold">
                          {format(new Date(request.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {request.preferred_date && (
                      <div className="flex items-center gap-3">
                        <ClockIcon className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-base-content/70">Data Preferencial</p>
                          <p className="font-semibold">
                            {format(new Date(request.preferred_date), 'dd/MM/yyyy', { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-start gap-3">
                      <MapPinIcon className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <p className="text-sm text-base-content/70">Endereço</p>
                        <p className="font-semibold">{request.address}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="divider"></div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Descrição</h3>
                  <p className="text-base-content/80 whitespace-pre-wrap">{request.description}</p>
                </div>

                {request.additional_info && (
                  <>
                    <div className="divider"></div>
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Informações Adicionais</h3>
                      <p className="text-base-content/80 whitespace-pre-wrap">{request.additional_info}</p>
                    </div>
                  </>
                )}

                {/* Images */}
                {request.images && request.images.length > 0 && (
                  <>
                    <div className="divider"></div>
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Imagens</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {request.images.map((image, index) => (
                          <div key={index} className="aspect-square">
                            <img
                              src={image.image}
                              alt={`Imagem ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => window.open(image.image, '_blank')}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Proposals */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title mb-4">
                  Propostas Recebidas ({proposals.length})
                </h2>
                
                {proposals.length === 0 ? (
                  <div className="text-center py-8">
                    <ChatBubbleLeftRightIcon className="h-16 w-16 mx-auto text-base-content/30 mb-4" />
                    <p className="text-base-content/70">Nenhuma proposta recebida ainda</p>
                    <p className="text-sm text-base-content/50 mt-2">
                      Aguarde, profissionais interessados enviarão suas propostas em breve.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {proposals.map((proposal) => (
                      <div key={proposal.id} className="border border-base-300 rounded-lg p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                          <div className="flex items-center gap-3">
                            <div className="avatar">
                              <div className="w-12 h-12 rounded-full">
                                {proposal.provider_profile?.user?.profile_picture ? (
                                  <img
                                    src={proposal.provider_profile.user.profile_picture}
                                    alt={proposal.provider_profile.user.first_name}
                                  />
                                ) : (
                                  <div className="bg-primary text-primary-content flex items-center justify-center">
                                    <UserIcon className="h-6 w-6" />
                                  </div>
                                )}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold">
                                {proposal.provider_profile?.user?.first_name} {proposal.provider_profile?.user?.last_name}
                              </h4>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  {renderStars(proposal.provider_profile?.rating || 0)}
                                </div>
                                <span className="text-sm text-base-content/70">
                                  ({proposal.provider_profile?.job_count || 0} trabalhos)
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {getProposalStatusBadge(proposal.status)}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-base-content/70">Preço Proposto</p>
                            <p className="text-lg font-bold text-primary">
                              R$ {parseFloat(proposal.proposed_price).toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-base-content/70">Duração Estimada</p>
                            <p className="font-semibold">{proposal.estimated_duration}</p>
                          </div>
                        </div>

                        {proposal.message && (
                          <div className="mb-4">
                            <p className="text-sm text-base-content/70 mb-2">Mensagem</p>
                            <p className="text-base-content/80">{proposal.message}</p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          {proposal.status === 'pending' && request.status === 'pending' && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedProposal(proposal)
                                  setShowProposalModal(true)
                                }}
                                className="btn btn-outline btn-sm gap-2"
                              >
                                <EyeIcon className="h-4 w-4" />
                                Ver Detalhes
                              </button>
                              <button
                                onClick={() => handleAcceptProposal(proposal.id)}
                                className="btn btn-success btn-sm gap-2"
                              >
                                <CheckIcon className="h-4 w-4" />
                                Aceitar
                              </button>
                              <button
                                onClick={() => handleRejectProposal(proposal.id)}
                                className="btn btn-error btn-outline btn-sm gap-2"
                              >
                                <XMarkIcon className="h-4 w-4" />
                                Rejeitar
                              </button>
                            </>
                          )}
                          
                          {proposal.status === 'accepted' && proposal.job?.status === 'completed' && !proposal.job?.providerReview && (
                            <button 
                              className="btn btn-warning btn-sm gap-2"
                              onClick={() => handleReviewProvider(proposal.job)}
                            >
                              <StarIcon className="h-4 w-4" />
                              Avaliar prestador
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card bg-base-100 shadow-lg sticky top-6">
              <div className="card-body">
                <h3 className="card-title text-lg mb-4">Informações da Solicitação</h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-base-content/70">ID da Solicitação</p>
                    <p className="font-mono text-sm">#{request.id}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-base-content/70">Status Atual</p>
                    <div className="mt-1">
                      {getStatusBadge(request.status)}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-base-content/70">Propostas Recebidas</p>
                    <p className="text-2xl font-bold text-primary">{proposals.length}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-base-content/70">Última Atualização</p>
                    <p className="text-sm">
                      {format(new Date(request.updated_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </p>
                  </div>
                </div>

                {request.status === 'pending' && (
                  <>
                    <div className="divider"></div>
                    <div className="space-y-2">
                      <Link
                        to={`/requests/${id}/edit`}
                        className="btn btn-outline w-full gap-2"
                      >
                        <PencilIcon className="h-4 w-4" />
                        Editar Solicitação
                      </Link>
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="btn btn-error btn-outline w-full gap-2"
                      >
                        <TrashIcon className="h-4 w-4" />
                        Excluir Solicitação
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Confirmar Exclusão</h3>
            <p className="mb-6">
              Tem certeza que deseja excluir esta solicitação? Esta ação não pode ser desfeita.
            </p>
            <div className="modal-action">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn btn-ghost"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteRequest}
                className="btn btn-error"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Proposal Detail Modal */}
      {showProposalModal && selectedProposal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">Detalhes da Proposta</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="avatar">
                  <div className="w-16 h-16 rounded-full">
                    {selectedProposal.provider_profile?.user?.profile_picture ? (
                      <img
                        src={selectedProposal.provider_profile.user.profile_picture}
                        alt={selectedProposal.provider_profile.user.first_name}
                      />
                    ) : (
                      <div className="bg-primary text-primary-content flex items-center justify-center">
                        <UserIcon className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-semibold">
                    {selectedProposal.provider_profile?.user?.first_name} {selectedProposal.provider_profile?.user?.last_name}
                  </h4>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {renderStars(selectedProposal.provider_profile?.rating || 0)}
                    </div>
                    <span className="text-sm text-base-content/70">
                      ({selectedProposal.provider_profile?.job_count || 0} trabalhos)
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-base-content/70">Preço Proposto</p>
                  <p className="text-2xl font-bold text-primary">
                    R$ {parseFloat(selectedProposal.proposed_price).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-base-content/70">Duração Estimada</p>
                  <p className="text-lg font-semibold">{selectedProposal.estimated_duration}</p>
                </div>
              </div>

              {selectedProposal.provider_profile?.bio && (
                <div>
                  <p className="text-sm text-base-content/70 mb-2">Sobre o Profissional</p>
                  <p className="text-base-content/80">{selectedProposal.provider_profile.bio}</p>
                </div>
              )}

              {selectedProposal.message && (
                <div>
                  <p className="text-sm text-base-content/70 mb-2">Mensagem da Proposta</p>
                  <p className="text-base-content/80">{selectedProposal.message}</p>
                </div>
              )}
            </div>

            <div className="modal-action">
              <button
                onClick={() => setShowProposalModal(false)}
                className="btn btn-ghost"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  handleRejectProposal(selectedProposal.id)
                  setShowProposalModal(false)
                }}
                className="btn btn-error btn-outline gap-2"
              >
                <XMarkIcon className="h-4 w-4" />
                Rejeitar
              </button>
              <button
                onClick={() => {
                  handleAcceptProposal(selectedProposal.id)
                  setShowProposalModal(false)
                }}
                className="btn btn-success gap-2"
              >
                <CheckIcon className="h-4 w-4" />
                Aceitar Proposta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedJob && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false)
            setSelectedJob(null)
          }}
          job={selectedJob}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  )
}

export default ServiceRequestDetail