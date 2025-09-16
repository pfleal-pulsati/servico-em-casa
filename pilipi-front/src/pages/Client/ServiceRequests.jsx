import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { apiService } from '../../services/api'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import toast from 'react-hot-toast'

const ServiceRequests = () => {
  const [serviceRequests, setServiceRequests] = useState([])
  const [filteredRequests, setFilteredRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [categories, setCategories] = useState([])
  const [categoryFilter, setCategoryFilter] = useState('all')

  useEffect(() => {
    fetchServiceRequests()
    fetchCategories()
  }, [])

  useEffect(() => {
    filterRequests()
  }, [serviceRequests, searchTerm, statusFilter, priorityFilter, categoryFilter])

  const fetchServiceRequests = async () => {
    try {
      const response = await apiService.serviceRequests.getAll()
      const requestsData = response.results || response.data || response
      setServiceRequests(Array.isArray(requestsData) ? requestsData : [])
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error)
      toast.error('Erro ao carregar solicitações')
      setServiceRequests([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await apiService.categories.getAll()
      
      // Verificar se a resposta tem a estrutura paginada
      const categoriesData = response.results || response.data || response
      setCategories(Array.isArray(categoriesData) ? categoriesData : [])
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
      setCategories([])
    }
  }

  const filterRequests = () => {
    let filtered = serviceRequests

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter)
    }

    // Filter by priority
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(request => request.priority === priorityFilter)
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(request => request.category?.id === parseInt(categoryFilter))
    }

    setFilteredRequests(filtered)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta solicitação?')) {
      try {
        await apiService.serviceRequests.delete(id)
        setServiceRequests(prev => prev.filter(request => request.id !== id))
        toast.success('Solicitação excluída com sucesso')
      } catch (error) {
        console.error('Erro ao excluir solicitação:', error)
        toast.error('Erro ao excluir solicitação')
      }
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'badge-warning', text: 'Pendente', icon: <ClockIcon className="h-4 w-4" /> },
      in_progress: { class: 'badge-info', text: 'Em Andamento', icon: <ClockIcon className="h-4 w-4" /> },
      completed: { class: 'badge-success', text: 'Concluído', icon: <CheckCircleIcon className="h-4 w-4" /> },
      cancelled: { class: 'badge-error', text: 'Cancelado', icon: <XCircleIcon className="h-4 w-4" /> }
    }
    
    const config = statusConfig[status] || statusConfig.pending
    return (
      <div className={`badge ${config.class} gap-2`}>
        {config.icon}
        {config.text}
      </div>
    )
  }

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: { class: 'badge-ghost', text: 'Baixa' },
      medium: { class: 'badge-warning', text: 'Média' },
      high: { class: 'badge-error', text: 'Alta' },
      urgent: { class: 'badge-error', text: 'Urgente' }
    }
    
    const config = priorityConfig[priority] || priorityConfig.medium
    return <div className={`badge ${config.class}`}>{config.text}</div>
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg text-primary"></div>
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
            <li>Solicitações de Serviços</li>
          </ul>
        </div>
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Minhas Solicitações</h1>
          <p className="text-base-content/70">
            Gerencie todas as suas solicitações de serviços.
          </p>
        </div>

        {/* Filters */}
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="form-control flex-1">
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Buscar por título ou descrição..."
                    className="input input-bordered flex-1"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button className="btn btn-square">
                    <MagnifyingGlassIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Status Filter */}
              <div className="form-control">
                <select
                  className="select select-bordered"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Todos os Status</option>
                  <option value="pending">Pendente</option>
                  <option value="in_progress">Em Andamento</option>
                  <option value="completed">Concluído</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div className="form-control">
                <select
                  className="select select-bordered"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <option value="all">Todas as Prioridades</option>
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>

              {/* Category Filter */}
              <div className="form-control">
                <select
                  className="select select-bordered"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">Todas as Categorias</option>
                  {Array.isArray(categories) && categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex justify-between items-center mb-6">
              <h2 className="card-title">
                Solicitações ({filteredRequests.length})
              </h2>
              <div className="flex items-center gap-2">
                <FunnelIcon className="h-5 w-5" />
                <span className="text-sm text-base-content/70">
                  {filteredRequests.length} de {serviceRequests.length} solicitações
                </span>
              </div>
            </div>
            
            {filteredRequests.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">
                  {serviceRequests.length === 0 ? 'Nenhuma solicitação encontrada' : 'Nenhum resultado encontrado'}
                </h3>
                <p className="text-base-content/70 mb-6">
                  {serviceRequests.length === 0 
                    ? 'Crie sua primeira solicitação de serviço para começar.'
                    : 'Tente ajustar os filtros para encontrar o que procura.'
                  }
                </p>
                {serviceRequests.length === 0 && (
                  <Link to="/service-requests/new" className="btn btn-primary gap-2">
                    <PlusIcon className="h-5 w-5" />
                    Criar Primeira Solicitação
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>Serviço</th>
                      <th>Status</th>
                      <th>Prioridade</th>
                      <th>Categoria</th>
                      <th>Orçamento</th>
                      <th>Data</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((request) => (
                      <tr key={request.id}>
                        <td>
                          <div>
                            <div className="font-bold">{request.title}</div>
                            <div className="text-sm text-base-content/70 max-w-xs truncate">
                              {request.description}
                            </div>
                          </div>
                        </td>
                        <td>{getStatusBadge(request.status)}</td>
                        <td>{getPriorityBadge(request.priority)}</td>
                        <td>
                          <div className="badge badge-outline">
                            {request.category?.name || 'N/A'}
                          </div>
                        </td>
                        <td>
                          <div className="font-semibold">
                            R$ {request.budget_min} - R$ {request.budget_max}
                          </div>
                        </td>
                        <td>
                          <div className="text-sm">
                            {format(new Date(request.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                          </div>
                        </td>
                        <td>
                          <div className="flex gap-1">
                            <Link 
                              to={`/service-requests/${request.id}`}
                              className="btn btn-sm btn-ghost tooltip"
                              data-tip="Ver detalhes"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Link>
                            {request.status === 'pending' && (
                              <>
                                <Link 
                                  to={`/service-requests/${request.id}/edit`}
                                  className="btn btn-sm btn-ghost tooltip"
                                  data-tip="Editar"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </Link>
                                <button 
                                  onClick={() => handleDelete(request.id)}
                                  className="btn btn-sm btn-ghost text-error tooltip"
                                  data-tip="Excluir"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ServiceRequests