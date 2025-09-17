import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentIcon,
  KeyIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const MasterPanel = () => {
  const { user } = useAuth();
  const [data, setData] = useState({ clients: [], providers: [] });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, clients, providers
  const [showPasswords, setShowPasswords] = useState({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    fetchMasterData();
  }, []);

  const fetchMasterData = async () => {
    try {
      setLoading(true);
      // Usando a instância axios diretamente para fazer a requisição
      const response = await fetch('http://127.0.0.1:8000/api/accounts/master-panel/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error('Erro ao carregar dados do painel master:', error);
      toast.error('Erro ao carregar dados do painel master');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (userId) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado para a área de transferência`);
  };

  const openPasswordModal = (user) => {
    setSelectedUser(user);
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordModal(true);
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setSelectedUser(null);
    setNewPassword('');
    setConfirmPassword('');
  };

  const handlePasswordChange = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error('Preencha todos os campos');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('A senha deve ter pelo menos 8 caracteres');
      return;
    }

    try {
      setChangingPassword(true);
      
      const response = await fetch('http://127.0.0.1:8000/api/accounts/admin/change-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          user_id: selectedUser.id,
          new_password: newPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao alterar senha');
      }

      const data = await response.json();
      toast.success(data.message);
      closePasswordModal();
      
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      toast.error(error.message || 'Erro ao alterar senha');
    } finally {
      setChangingPassword(false);
    }
  };

  const filteredData = () => {
    let allUsers = [];
    
    if (filterType === 'all' || filterType === 'clients') {
      allUsers = [...allUsers, ...data.clients.map(client => ({ ...client, type: 'Cliente' }))];
    }
    
    if (filterType === 'all' || filterType === 'providers') {
      allUsers = [...allUsers, ...data.providers.map(provider => ({ ...provider, type: 'Prestador' }))];
    }

    if (searchTerm) {
      allUsers = allUsers.filter(user => 
        user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone_number?.includes(searchTerm)
      );
    }

    return allUsers;
  };



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full px-2 py-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <ShieldCheckIcon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-base-content">Painel Master</h1>
        </div>
        
        {/* Aviso de Segurança */}
        <div className="alert alert-warning mb-6">
          <ExclamationTriangleIcon className="h-6 w-6" />
          <div>
            <h3 className="font-bold">Aviso de Segurança</h3>
            <div className="text-sm">
              Este painel contém informações sensíveis. Use com responsabilidade e mantenha a confidencialidade dos dados.
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-figure text-primary">
              <UserIcon className="h-8 w-8" />
            </div>
            <div className="stat-title">Total de Usuários</div>
            <div className="stat-value text-primary">{data.clients.length + data.providers.length}</div>
          </div>
          
          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-figure text-secondary">
              <UserIcon className="h-8 w-8" />
            </div>
            <div className="stat-title">Clientes</div>
            <div className="stat-value text-secondary">{data.clients.length}</div>
          </div>
          
          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-figure text-accent">
              <UserIcon className="h-8 w-8" />
            </div>
            <div className="stat-title">Prestadores</div>
            <div className="stat-value text-accent">{data.providers.length}</div>
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Busca */}
            <div className="form-control flex-1">
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Buscar por nome, usuário ou telefone..."
                  className="input input-bordered w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className="btn btn-square btn-primary">
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </span>
              </div>
            </div>

            {/* Filtro por tipo */}
            <div className="form-control">
              <select
                className="select select-bordered"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">Todos os usuários</option>
                <option value="clients">Apenas clientes</option>
                <option value="providers">Apenas prestadores</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Usuários */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title mb-4">
            <FunnelIcon className="h-6 w-6" />
            Lista de Usuários ({filteredData().length})
          </h2>

          <div className="overflow-x-auto w-full">
            <table className="table table-zebra w-full min-w-full">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Nome</th>
                  <th>Usuário</th>
                  <th>Telefone</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredData().map((user) => (
                  <tr key={`${user.type}-${user.id}`} className="hover">
                    <td>
                      <div className={`badge ${user.type === 'Cliente' ? 'badge-secondary' : 'badge-accent'}`}>
                        {user.type}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar placeholder">
                          <div className="bg-neutral-focus text-neutral-content rounded-full w-8">
                            <span className="text-xs">
                              {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="font-bold">{user.first_name} {user.last_name}</div>
                          {user.provider_profile && (
                            <div className="text-sm opacity-50">
                              {user.provider_profile.business_name}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span>{user.username}</span>
                        <button
                          className="btn btn-ghost btn-xs"
                          onClick={() => copyToClipboard(user.username, 'Usuário')}
                        >
                          <ClipboardDocumentIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span>{user.phone_number || 'N/A'}</span>
                        {user.phone_number && (
                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={() => copyToClipboard(user.phone_number, 'Telefone')}
                          >
                            <ClipboardDocumentIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <div className="tooltip" data-tip="Usuário ativo">
                          <div className={`badge ${user.is_active ? 'badge-success' : 'badge-error'}`}>
                            {user.is_active ? 'Ativo' : 'Inativo'}
                          </div>
                        </div>
                        {user.provider_profile && (
                          <div className="tooltip" data-tip="Prestador verificado">
                            <div className={`badge ${user.provider_profile.is_verified ? 'badge-info' : 'badge-warning'}`}>
                              {user.provider_profile.is_verified ? 'Verificado' : 'Pendente'}
                            </div>
                          </div>
                        )}
                        <div className="tooltip" data-tip="Alterar senha">
                          <button
                            className="btn btn-ghost btn-xs text-warning"
                            onClick={() => openPasswordModal(user)}
                          >
                            <KeyIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredData().length === 0 && (
              <div className="text-center py-8">
                <UserIcon className="h-16 w-16 mx-auto text-base-300 mb-4" />
                <p className="text-base-content/60">Nenhum usuário encontrado</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Alteração de Senha */}
      {showPasswordModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
              <KeyIcon className="h-6 w-6 inline mr-2" />
              Alterar Senha do Usuário
            </h3>
            
            {selectedUser && (
              <div className="mb-4 p-4 bg-base-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="avatar placeholder">
                    <div className="bg-neutral-focus text-neutral-content rounded-full w-10">
                      <span className="text-sm">
                        {selectedUser.first_name?.charAt(0)}{selectedUser.last_name?.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="font-bold">{selectedUser.first_name} {selectedUser.last_name}</div>
                    <div className="text-sm opacity-70">{selectedUser.email}</div>
                    <div className={`badge badge-sm ${selectedUser.type === 'Cliente' ? 'badge-secondary' : 'badge-accent'}`}>
                      {selectedUser.type}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Nova Senha</span>
              </label>
              <input
                type="password"
                placeholder="Digite a nova senha (mín. 8 caracteres)"
                className="input input-bordered"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={changingPassword}
              />
            </div>

            <div className="form-control mb-6">
              <label className="label">
                <span className="label-text">Confirmar Nova Senha</span>
              </label>
              <input
                type="password"
                placeholder="Confirme a nova senha"
                className="input input-bordered"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={changingPassword}
              />
            </div>

            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={closePasswordModal}
                disabled={changingPassword}
              >
                Cancelar
              </button>
              <button
                className={`btn btn-warning ${changingPassword ? 'loading' : ''}`}
                onClick={handlePasswordChange}
                disabled={changingPassword || !newPassword || !confirmPassword}
              >
                {changingPassword ? 'Alterando...' : 'Alterar Senha'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterPanel;