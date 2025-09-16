import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import {
  BellIcon,
  CheckIcon,
  TrashIcon,
  EyeIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    read: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [filters, pagination.page]);

  const fetchNotifications = async () => {
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
      
      const response = await apiService.notifications.getAll(params);
      setNotifications(response.notifications || []);
      setPagination(prev => ({
        ...prev,
        total: response.total || 0,
        totalPages: response.totalPages || 0
      }));
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      toast.error('Erro ao carregar notificações');
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
      type: '',
      read: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const markAsRead = async (notificationId) => {
    try {
      await apiService.notifications.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
      toast.error('Erro ao marcar notificação como lida');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await apiService.deleteNotification(notificationId);
      setNotifications(prev => 
        prev.filter(notification => notification.id !== notificationId)
      );
      toast.success('Notificação excluída');
    } catch (error) {
      console.error('Erro ao excluir notificação:', error);
      toast.error('Erro ao excluir notificação');
    }
  };

  const handleSelectNotification = (notificationId) => {
    setSelectedNotifications(prev => {
      if (prev.includes(notificationId)) {
        return prev.filter(id => id !== notificationId);
      } else {
        return [...prev, notificationId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map(n => n.id));
    }
  };

  const markSelectedAsRead = async () => {
    try {
      setBulkLoading(true);
      await apiService.notifications.markAllAsRead();
      setNotifications(prev => 
        prev.map(notification => 
          selectedNotifications.includes(notification.id)
            ? { ...notification, read: true }
            : notification
        )
      );
      setSelectedNotifications([]);
      toast.success('Notificações marcadas como lidas');
    } catch (error) {
      console.error('Erro ao marcar notificações como lidas:', error);
      toast.error('Erro ao marcar notificações como lidas');
    } finally {
      setBulkLoading(false);
    }
  };

  const deleteSelected = async () => {
    try {
      setBulkLoading(true);
      await apiService.deleteNotifications(selectedNotifications);
      setNotifications(prev => 
        prev.filter(notification => !selectedNotifications.includes(notification.id))
      );
      setSelectedNotifications([]);
      toast.success('Notificações excluídas');
    } catch (error) {
      console.error('Erro ao excluir notificações:', error);
      toast.error('Erro ao excluir notificações');
    } finally {
      setBulkLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'info':
        return <InformationCircleIcon className="w-5 h-5 text-info" />;
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-success" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-warning" />;
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-error" />;
      default:
        return <BellIcon className="w-5 h-5 text-primary" />;
    }
  };

  const getNotificationTypeText = (type) => {
    switch (type) {
      case 'proposal_received': return 'Proposta recebida';
      case 'proposal_accepted': return 'Proposta aceita';
      case 'proposal_rejected': return 'Proposta rejeitada';
      case 'job_started': return 'Trabalho iniciado';
      case 'job_completed': return 'Trabalho concluído';
      case 'review_received': return 'Avaliação recebida';
      case 'payment_received': return 'Pagamento recebido';
      case 'system': return 'Sistema';
      default: return type;
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `${diffInMinutes} min atrás`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} h atrás`;
    } else if (diffInHours < 48) {
      return 'Ontem';
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-base-content mb-2">
            Notificações
          </h1>
          <p className="text-base-content/70">
            Acompanhe todas as atualizações importantes
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">
            {unreadCount}
          </div>
          <div className="text-sm text-base-content/70">
            não lidas
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="card bg-base-100 shadow-lg mb-8">
        <div className="card-body">
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <div className="form-control">
                <select 
                  className="select select-bordered select-sm"
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  <option value="">Todos os tipos</option>
                  <option value="proposal_received">Proposta recebida</option>
                  <option value="proposal_accepted">Proposta aceita</option>
                  <option value="proposal_rejected">Proposta rejeitada</option>
                  <option value="job_started">Trabalho iniciado</option>
                  <option value="job_completed">Trabalho concluído</option>
                  <option value="review_received">Avaliação recebida</option>
                  <option value="payment_received">Pagamento recebido</option>
                  <option value="system">Sistema</option>
                </select>
              </div>
              
              <div className="form-control">
                <select 
                  className="select select-bordered select-sm"
                  value={filters.read}
                  onChange={(e) => handleFilterChange('read', e.target.value)}
                >
                  <option value="">Todas</option>
                  <option value="false">Não lidas</option>
                  <option value="true">Lidas</option>
                </select>
              </div>
              
              <button 
                className="btn btn-ghost btn-sm"
                onClick={clearFilters}
              >
                Limpar filtros
              </button>
            </div>

            {/* Bulk Actions */}
            {selectedNotifications.length > 0 && (
              <div className="flex gap-2">
                <button 
                  className="btn btn-sm btn-ghost"
                  onClick={markSelectedAsRead}
                  disabled={bulkLoading}
                >
                  {bulkLoading && <span className="loading loading-spinner loading-sm"></span>}
                  <CheckIcon className="w-4 h-4" />
                  Marcar como lidas
                </button>
                <button 
                  className="btn btn-sm btn-error"
                  onClick={deleteSelected}
                  disabled={bulkLoading}
                >
                  {bulkLoading && <span className="loading loading-spinner loading-sm"></span>}
                  <TrashIcon className="w-4 h-4" />
                  Excluir
                </button>
              </div>
            )}
          </div>

          {/* Select All */}
          {notifications.length > 0 && (
            <div className="flex items-center gap-2 mt-4">
              <input 
                type="checkbox" 
                className="checkbox checkbox-sm"
                checked={selectedNotifications.length === notifications.length}
                onChange={handleSelectAll}
              />
              <span className="text-sm text-base-content/70">
                Selecionar todas ({notifications.length})
              </span>
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

      {/* Notifications List */}
      {!loading && (
        <div className="space-y-2 mb-8">
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`card bg-base-100 shadow-sm hover:shadow-md transition-shadow ${
                !notification.read ? 'border-l-4 border-l-primary' : ''
              }`}
            >
              <div className="card-body p-4">
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <input 
                    type="checkbox" 
                    className="checkbox checkbox-sm mt-1"
                    checked={selectedNotifications.includes(notification.id)}
                    onChange={() => handleSelectNotification(notification.id)}
                  />

                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`badge badge-sm ${
                            notification.type === 'success' ? 'badge-success' :
                            notification.type === 'warning' ? 'badge-warning' :
                            notification.type === 'error' ? 'badge-error' :
                            'badge-info'
                          }`}>
                            {getNotificationTypeText(notification.type)}
                          </span>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          )}
                        </div>
                        
                        <h3 className={`font-semibold text-base-content mb-1 ${
                          !notification.read ? 'font-bold' : ''
                        }`}>
                          {notification.title}
                        </h3>
                        
                        <p className="text-sm text-base-content/70 mb-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center gap-2 text-xs text-base-content/50">
                          <ClockIcon className="w-3 h-3" />
                          <span>{formatDateTime(notification.createdAt)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1">
                        {!notification.read && (
                          <button 
                            className="btn btn-ghost btn-xs"
                            onClick={() => markAsRead(notification.id)}
                            title="Marcar como lida"
                          >
                            <EyeIcon className="w-3 h-3" />
                          </button>
                        )}
                        
                        <button 
                          className="btn btn-ghost btn-xs text-error"
                          onClick={() => deleteNotification(notification.id)}
                          title="Excluir"
                        >
                          <TrashIcon className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Additional Data */}
                    {notification.data && (
                      <div className="mt-3 p-3 bg-base-200 rounded-lg">
                        {notification.data.serviceRequestTitle && (
                          <div className="text-sm">
                            <span className="font-medium">Serviço:</span> {notification.data.serviceRequestTitle}
                          </div>
                        )}
                        {notification.data.proposalBudget && (
                          <div className="text-sm">
                            <span className="font-medium">Valor:</span> R$ {notification.data.proposalBudget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        )}
                        {notification.data.rating && (
                          <div className="text-sm">
                            <span className="font-medium">Avaliação:</span> {notification.data.rating}/5 estrelas
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && notifications.length === 0 && (
        <div className="text-center py-12">
          <BellIcon className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
          <h3 className="text-xl font-semibold text-base-content mb-2">
            Nenhuma notificação encontrada
          </h3>
          <p className="text-base-content/70 mb-4">
            Você não tem notificações ou nenhuma corresponde aos filtros aplicados.
          </p>
          <button 
            className="btn btn-ghost"
            onClick={clearFilters}
          >
            Limpar filtros
          </button>
        </div>
      )}

      {/* Pagination */}
      {!loading && notifications.length > 0 && pagination.totalPages > 1 && (
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

export default Notifications;