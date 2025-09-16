import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import {
  BellIcon,
  ClockIcon,
  CurrencyDollarIcon,
  StarIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalOpportunities: 0,
    pendingProposals: 0,
    activeJobs: 0,
    completedJobs: 0,
    totalEarnings: 0,
    averageRating: 0
  });
  const [opportunities, setOpportunities] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, opportunitiesRes, proposalsRes] = await Promise.all([
        apiService.getProviderStats(),
        apiService.getOpportunities({ limit: 5 }),
        apiService.getMyProposals({ limit: 5 })
      ]);
      
      setStats(statsRes.data);
      setOpportunities(opportunitiesRes.data.requests || []);
      setProposals(proposalsRes.data.proposals || []);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickProposal = async (requestId, budget) => {
    try {
      await apiService.createProposal({
        serviceRequestId: requestId,
        budget,
        description: 'Proposta rápida enviada pelo dashboard',
        estimatedDays: 3
      });
      
      // Atualizar dados
      fetchDashboardData();
    } catch (error) {
      console.error('Erro ao enviar proposta:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-base-content mb-2">
          Bem-vindo, {user?.name}!
        </h1>
        <p className="text-base-content/70">
          Gerencie suas oportunidades e propostas
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-primary">
            <ClockIcon className="w-8 h-8" />
          </div>
          <div className="stat-title">Oportunidades Disponíveis</div>
          <div className="stat-value text-primary">{stats.totalOpportunities}</div>
          <div className="stat-desc">Novas oportunidades para você</div>
        </div>

        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-warning">
            <BellIcon className="w-8 h-8" />
          </div>
          <div className="stat-title">Propostas Pendentes</div>
          <div className="stat-value text-warning">{stats.pendingProposals}</div>
          <div className="stat-desc">Aguardando resposta</div>
        </div>

        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-success">
            <CheckIcon className="w-8 h-8" />
          </div>
          <div className="stat-title">Trabalhos Ativos</div>
          <div className="stat-value text-success">{stats.activeJobs}</div>
          <div className="stat-desc">Em andamento</div>
        </div>

        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-info">
            <StarIcon className="w-8 h-8" />
          </div>
          <div className="stat-title">Trabalhos Concluídos</div>
          <div className="stat-value text-info">{stats.completedJobs}</div>
          <div className="stat-desc">Total finalizado</div>
        </div>

        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-accent">
            <CurrencyDollarIcon className="w-8 h-8" />
          </div>
          <div className="stat-title">Ganhos Totais</div>
          <div className="stat-value text-accent">
            R$ {stats.totalEarnings?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="stat-desc">Receita acumulada</div>
        </div>

        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-secondary">
            <StarIcon className="w-8 h-8" />
          </div>
          <div className="stat-title">Avaliação Média</div>
          <div className="stat-value text-secondary">
            {stats.averageRating?.toFixed(1) || '0.0'}
          </div>
          <div className="stat-desc">De 5.0 estrelas</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <Link to="/opportunities" className="btn btn-primary btn-lg">
          <ClockIcon className="w-5 h-5" />
          Ver Oportunidades
        </Link>
        <Link to="/my-services" className="btn btn-accent btn-lg">
          <CheckIcon className="w-5 h-5" />
          Meus Trabalhos
        </Link>
        <Link to="/profile" className="btn btn-outline btn-lg">
          <StarIcon className="w-5 h-5" />
          Meu Perfil
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Opportunities */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title text-xl">Oportunidades Recentes</h2>
              <Link to="/opportunities" className="btn btn-sm btn-ghost">
                Ver todas
              </Link>
            </div>
            
            {opportunities.length === 0 ? (
              <div className="text-center py-8">
                <ClockIcon className="w-12 h-12 mx-auto text-base-content/30 mb-4" />
                <p className="text-base-content/70">Nenhuma oportunidade disponível</p>
              </div>
            ) : (
              <div className="space-y-4">
                {opportunities.map((opportunity) => (
                  <div key={opportunity.id} className="border border-base-300 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-base-content">
                        {opportunity.title}
                      </h3>
                      <div className="badge badge-primary">
                        R$ {opportunity.budget?.toLocaleString('pt-BR')}
                      </div>
                    </div>
                    <p className="text-sm text-base-content/70 mb-3">
                      {opportunity.description?.substring(0, 100)}...
                    </p>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <div className="badge badge-outline badge-sm">
                          {opportunity.category?.name}
                        </div>
                        <div className="badge badge-outline badge-sm">
                          {opportunity.priority}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link 
                          to={`/opportunities/${opportunity.id}`}
                          className="btn btn-sm btn-ghost"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => handleQuickProposal(opportunity.id, opportunity.budget)}
                          className="btn btn-sm btn-primary"
                        >
                          Propor
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Proposals */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title text-xl">Propostas Recentes</h2>
              <span className="text-sm text-base-content/70">
                Propostas enviadas
              </span>
            </div>
            
            {proposals.length === 0 ? (
              <div className="text-center py-8">
                <BellIcon className="w-12 h-12 mx-auto text-base-content/30 mb-4" />
                <p className="text-base-content/70">Nenhuma proposta enviada</p>
              </div>
            ) : (
              <div className="space-y-4">
                {proposals.map((proposal) => (
                  <div key={proposal.id} className="border border-base-300 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-base-content">
                        {proposal.serviceRequest?.title}
                      </h3>
                      <div className={`badge ${
                        proposal.status === 'accepted' ? 'badge-success' :
                        proposal.status === 'rejected' ? 'badge-error' :
                        'badge-warning'
                      }`}>
                        {proposal.status === 'pending' ? 'Pendente' :
                         proposal.status === 'accepted' ? 'Aceita' : 'Rejeitada'}
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm text-base-content/70">
                      <span>Orçamento: R$ {proposal.budget?.toLocaleString('pt-BR')}</span>
                      <span>Prazo: {proposal.estimatedDays} dias</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;