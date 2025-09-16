import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { apiService } from '../../services/api'
import {
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ChartBarIcon,
  UserIcon,
  CogIcon
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const Dashboard = () => {
  const { user } = useAuth()
  const [serviceRequests, setServiceRequests] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    completed: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchServiceRequests()
    fetchStats()
  }, [])

  const fetchServiceRequests = async () => {
    try {
      const response = await apiService.getServiceRequests()
      setServiceRequests(response.data?.results || response.data || [])
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error)
      setServiceRequests([])
    }
  }

  const fetchStats = async () => {
    try {
      const response = await apiService.getClientStats()
      setStats({
        total: response.data?.total || 0,
        pending: response.data?.pending || 0,
        in_progress: response.data?.in_progress || 0,
        completed: response.data?.completed || 0
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
      setStats({
        total: 0,
        pending: 0,
        in_progress: 0,
        completed: 0
      })
    } finally {
      setLoading(false)
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
            <li>Cliente</li>
          </ul>
        </div>

        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-montserrat font-bold mb-2">
            Olá, {user?.first_name || 'Cliente'}! 👋
          </h1>
          <p className="text-base-content/70 font-lato">
            Gerencie suas solicitações de serviços e acompanhe o progresso.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="stat bg-base-100 rounded-lg shadow">
            <div className="stat-figure text-primary">
              <ChartBarIcon className="h-8 w-8" />
            </div>
            <div className="stat-title font-montserrat">Total de Solicitações</div>
            <div className="stat-value text-primary">{stats.total}</div>
            <div className="stat-desc">Todas as suas solicitações</div>
          </div>
          
          <div className="stat bg-base-100 rounded-lg shadow">
            <div className="stat-figure text-warning">
              <ClockIcon className="h-8 w-8" />
            </div>
            <div className="stat-title font-montserrat">Pendentes</div>
            <div className="stat-value text-warning">{stats.pending}</div>
            <div className="stat-desc">Aguardando propostas</div>
          </div>
          
          <div className="stat bg-base-100 rounded-lg shadow">
            <div className="stat-figure text-info">
              <ClockIcon className="h-8 w-8" />
            </div>
            <div className="stat-title font-montserrat">Em Andamento</div>
            <div className="stat-value text-info">{stats.in_progress}</div>
            <div className="stat-desc">Sendo executadas</div>
          </div>
          
          <div className="stat bg-base-100 rounded-lg shadow">
            <div className="stat-figure text-success">
              <CheckCircleIcon className="h-8 w-8" />
            </div>
            <div className="stat-title font-montserrat">Concluídas</div>
            <div className="stat-value text-success">{stats.completed}</div>
            <div className="stat-desc">Serviços finalizados</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card bg-base-100 shadow-lg mb-8">
          <div className="card-body">
            <h2 className="card-title mb-4">Ações Rápidas</h2>
            <div className="flex flex-wrap gap-4">
              <Link to="/requests/new" className="btn btn-primary gap-2">
                <PlusIcon className="h-5 w-5" />
                Nova Solicitação
              </Link>
              <Link to="/requests" className="btn btn-outline gap-2">
                <EyeIcon className="h-5 w-5" />
                Ver Todas
              </Link>
              <Link to="/notifications" className="btn btn-ghost gap-2">
                <ClockIcon className="h-5 w-5" />
                Notificações
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Service Requests */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex justify-between items-center mb-6">
              <h2 className="card-title">Solicitações Recentes</h2>
              <Link to="/requests" className="btn btn-sm btn-outline">
                Ver Todas
              </Link>
            </div>
            
            {serviceRequests.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold mb-2">Nenhuma solicitação ainda</h3>
                <p className="text-base-content/70 mb-6">
                  Crie sua primeira solicitação de serviço para começar.
                </p>
                <Link to="/requests/new" className="btn btn-primary gap-2">
                  <PlusIcon className="h-5 w-5" />
                  Criar Primeira Solicitação
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>Serviço</th>
                      <th>Status</th>
                      <th>Prioridade</th>
                      <th>Orçamento</th>
                      <th>Data</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceRequests.slice(0, 5).map((request) => (
                      <tr key={request.id}>
                        <td>
                          <div>
                            <div className="font-bold">{request.title}</div>
                            <div className="text-sm text-base-content/70">
                              {request.category?.name}
                            </div>
                          </div>
                        </td>
                        <td>{getStatusBadge(request.status)}</td>
                        <td>{getPriorityBadge(request.priority)}</td>
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
                          <div className="flex gap-2">
                            <Link 
                              to={`/requests/${request.id}`}
                              className="btn btn-sm btn-ghost"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Link>
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

export default Dashboard