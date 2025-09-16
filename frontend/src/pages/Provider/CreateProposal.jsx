import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { apiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  ArrowLeftIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  DocumentTextIcon,
  PaperAirplaneIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const CreateProposal = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existingProposal, setExistingProposal] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    defaultValues: {
      budget: '',
      estimatedDays: '',
      description: '',
      terms: ''
    }
  });

  const watchBudget = watch('budget');

  useEffect(() => {
    fetchOpportunityDetails();
  }, [id]);

  const fetchOpportunityDetails = async () => {
    try {
      setLoading(true);
      const [opportunityRes, proposalsRes] = await Promise.all([
        apiService.serviceRequests.getById(id),
        apiService.getServiceRequestProposals(id)
      ]);
      
      setOpportunity(opportunityRes.data);
      
      // Check if user already has a proposal for this opportunity
      const userProposal = proposalsRes.data.proposals?.find(
        proposal => proposal.providerId === user?.id
      );
      
      if (userProposal) {
        setExistingProposal(userProposal);
        // Pre-fill form with existing proposal data
        setValue('budget', userProposal.budget);
        setValue('estimatedDays', userProposal.estimatedDays);
        setValue('description', userProposal.description);
        setValue('terms', userProposal.terms || '');
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes da oportunidade:', error);
      toast.error('Erro ao carregar dados da oportunidade');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      
      const proposalData = {
        serviceRequestId: parseInt(id),
        budget: parseFloat(data.budget),
        estimatedDays: parseInt(data.estimatedDays),
        description: data.description,
        terms: data.terms
      };

      if (existingProposal) {
        // Update existing proposal
        await apiService.updateProposal(existingProposal.id, proposalData);
        toast.success('Proposta atualizada com sucesso!');
      } else {
        // Create new proposal
        await apiService.createProposal(proposalData);
        toast.success('Proposta enviada com sucesso!');
      }
      
      navigate(`/provider/opportunities/${id}`);
    } catch (error) {
      console.error('Erro ao enviar proposta:', error);
      toast.error(error.response?.data?.message || 'Erro ao enviar proposta');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateDeadline = () => {
    const days = parseInt(watch('estimatedDays'));
    if (days && !isNaN(days)) {
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + days);
      return deadline.toLocaleDateString('pt-BR');
    }
    return null;
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

  if (opportunity.status !== 'aberto') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 mx-auto text-warning mb-4" />
          <h2 className="text-2xl font-bold text-base-content mb-4">
            Esta oportunidade não está mais disponível
          </h2>
          <p className="text-base-content/70 mb-4">
            O status atual é: {opportunity.status}
          </p>
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
          onClick={() => navigate(`/provider/opportunities/${id}`)}
          className="btn btn-ghost btn-circle"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-base-content mb-2">
            {existingProposal ? 'Editar Proposta' : 'Enviar Proposta'}
          </h1>
          <p className="text-base-content/70">
            Para: {opportunity.title}
          </p>
        </div>
      </div>

      {existingProposal && (
        <div className="alert alert-info mb-6">
          <ExclamationTriangleIcon className="w-6 h-6" />
          <div>
            <h3 className="font-bold">Você já enviou uma proposta para esta oportunidade</h3>
            <div className="text-sm">Você pode editar e reenviar sua proposta abaixo.</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Budget and Timeline */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-xl mb-4">
                  <CurrencyDollarIcon className="w-6 h-6" />
                  Orçamento e Prazo
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Valor da Proposta *</span>
                    </label>
                    <div className="input-group">
                      <span className="bg-base-200">R$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0,00"
                        className={`input input-bordered flex-1 ${
                          errors.budget ? 'input-error' : ''
                        }`}
                        {...register('budget', {
                          required: 'Valor é obrigatório',
                          min: { value: 0.01, message: 'Valor deve ser maior que zero' },
                          max: { 
                            value: opportunity.budget * 2, 
                            message: `Valor não pode ser maior que R$ ${(opportunity.budget * 2).toLocaleString('pt-BR')}` 
                          }
                        })}
                      />
                    </div>
                    {errors.budget && (
                      <label className="label">
                        <span className="label-text-alt text-error">
                          {errors.budget.message}
                        </span>
                      </label>
                    )}
                    <label className="label">
                      <span className="label-text-alt text-base-content/70">
                        Orçamento do cliente: R$ {opportunity.budget?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </label>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Prazo (dias) *</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      placeholder="Ex: 7"
                      className={`input input-bordered ${
                        errors.estimatedDays ? 'input-error' : ''
                      }`}
                      {...register('estimatedDays', {
                        required: 'Prazo é obrigatório',
                        min: { value: 1, message: 'Prazo deve ser pelo menos 1 dia' },
                        max: { value: 365, message: 'Prazo não pode ser maior que 365 dias' }
                      })}
                    />
                    {errors.estimatedDays && (
                      <label className="label">
                        <span className="label-text-alt text-error">
                          {errors.estimatedDays.message}
                        </span>
                      </label>
                    )}
                    {calculateDeadline() && (
                      <label className="label">
                        <span className="label-text-alt text-base-content/70">
                          Entrega prevista: {calculateDeadline()}
                        </span>
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-xl mb-4">
                  <DocumentTextIcon className="w-6 h-6" />
                  Descrição da Proposta
                </h2>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Descreva como você realizará o trabalho *</span>
                  </label>
                  <textarea
                    placeholder="Explique detalhadamente como você pretende executar o serviço, quais materiais serão utilizados, metodologia, etc."
                    className={`textarea textarea-bordered h-32 ${
                      errors.description ? 'textarea-error' : ''
                    }`}
                    {...register('description', {
                      required: 'Descrição é obrigatória',
                      minLength: { value: 50, message: 'Descrição deve ter pelo menos 50 caracteres' },
                      maxLength: { value: 2000, message: 'Descrição não pode ter mais que 2000 caracteres' }
                    })}
                  ></textarea>
                  {errors.description && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {errors.description.message}
                      </span>
                    </label>
                  )}
                  <label className="label">
                    <span className="label-text-alt text-base-content/70">
                      {watch('description')?.length || 0}/2000 caracteres
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-xl mb-4">Termos e Condições</h2>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Condições especiais (opcional)</span>
                  </label>
                  <textarea
                    placeholder="Inclua qualquer condição especial, forma de pagamento, garantias, etc."
                    className="textarea textarea-bordered h-24"
                    {...register('terms', {
                      maxLength: { value: 1000, message: 'Termos não podem ter mais que 1000 caracteres' }
                    })}
                  ></textarea>
                  {errors.terms && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {errors.terms.message}
                      </span>
                    </label>
                  )}
                  <label className="label">
                    <span className="label-text-alt text-base-content/70">
                      {watch('terms')?.length || 0}/1000 caracteres
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate(`/provider/opportunities/${id}`)}
                className="btn btn-ghost flex-1"
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary flex-1"
                disabled={submitting}
              >
                {submitting && <span className="loading loading-spinner loading-sm"></span>}
                <PaperAirplaneIcon className="w-5 h-5" />
                {existingProposal ? 'Atualizar Proposta' : 'Enviar Proposta'}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Opportunity Summary */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="card-title text-lg mb-4">Resumo da Oportunidade</h3>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-base-content">{opportunity.title}</h4>
                  <p className="text-sm text-base-content/70 line-clamp-3">
                    {opportunity.description}
                  </p>
                </div>
                
                <div className="divider my-2"></div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-base-content/70">Orçamento:</span>
                    <span className="font-semibold text-success">
                      R$ {opportunity.budget?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  
                  {opportunity.preferredDate && (
                    <div className="flex justify-between">
                      <span className="text-base-content/70">Data preferida:</span>
                      <span className="font-semibold">
                        {formatDate(opportunity.preferredDate)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-base-content/70">Categoria:</span>
                    <span className="font-semibold">
                      {opportunity.category?.name}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-base-content/70">Prioridade:</span>
                    <span className="font-semibold">
                      {opportunity.priority}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="card bg-primary/10 border border-primary/20">
            <div className="card-body">
              <h3 className="card-title text-lg text-primary mb-4">Dicas para uma boa proposta</h3>
              
              <ul className="space-y-2 text-sm text-base-content/80">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Seja específico sobre como realizará o trabalho</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Mencione sua experiência relevante</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Seja realista com prazos e orçamento</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Inclua garantias ou condições especiais</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Demonstre profissionalismo na comunicação</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProposal;