import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../contexts/AuthContext'
import { apiService } from '../../services/api'
import {
  ArrowLeftIcon,
  PhotoIcon,
  XMarkIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const EditServiceRequest = () => {
  const { user } = useAuth()
  const { id } = useParams()
  const [categories, setCategories] = useState([])
  const [selectedImages, setSelectedImages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadingRequest, setLoadingRequest] = useState(true)
  const navigate = useNavigate()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
    setValue,
    reset
  } = useForm()

  const budgetMin = watch('budget_min')
  const budgetMax = watch('budget_max')

  useEffect(() => {
    fetchCategories()
    fetchServiceRequest()
  }, [id])

  const fetchCategories = async () => {
    try {
      const response = await apiService.categories.getAll()
      setCategories(response.results || response)
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
      toast.error('Erro ao carregar categorias')
    }
  }

  const fetchServiceRequest = async () => {
    try {
      setLoadingRequest(true)
      const request = await apiService.serviceRequests.getById(id)
      
      // Preencher o formulário com os dados existentes
      reset({
        title: request.title,
        description: request.description,
        category: request.category.id,
        priority: request.priority,
        budget_min: request.budget_min,
        budget_max: request.budget_max,
        address: request.address,
        additional_info: request.additional_info || ''
      })
    } catch (error) {
      console.error('Erro ao carregar solicitação:', error)
      toast.error('Erro ao carregar solicitação')
      navigate('/requests')
    } finally {
      setLoadingRequest(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      setIsLoading(true)
      
      // Validar orçamento
      if (parseFloat(data.budget_min) >= parseFloat(data.budget_max)) {
        setError('budget_max', {
          type: 'manual',
          message: 'Orçamento máximo deve ser maior que o mínimo'
        })
        return
      }

      const formData = new FormData()
      
      // Adicionar dados do formulário
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
          formData.append(key, data[key])
        }
      })

      // Adicionar imagens se houver
      selectedImages.forEach((image, index) => {
        formData.append(`images`, image)
      })

      const response = await apiService.serviceRequests.update(id, formData)
      
      toast.success('Solicitação atualizada com sucesso!')
      navigate(`/requests/${id}`)
    } catch (error) {
      console.error('Erro ao atualizar solicitação:', error)
      
      if (error.response?.data) {
        const errorData = error.response.data
        
        // Tratar erros de validação do backend
        Object.keys(errorData).forEach(field => {
          if (Array.isArray(errorData[field])) {
            setError(field, {
              type: 'manual',
              message: errorData[field][0]
            })
          }
        })
      } else {
        toast.error('Erro ao atualizar solicitação. Tente novamente.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files)
    
    if (files.length + selectedImages.length > 5) {
      toast.error('Máximo de 5 imagens permitidas')
      return
    }

    setSelectedImages(prev => [...prev, ...files])
  }

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
  }

  if (loadingRequest) {
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
            <li><Link to="/requests">Solicitações</Link></li>
            <li>Editar Solicitação</li>
          </ul>
        </div>
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Editar Solicitação de Serviço</h1>
          <p className="text-base-content/70">
            Atualize as informações da sua solicitação de serviço.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h2 className="card-title mb-4">Informações Básicas</h2>
                  
                  {/* Title */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Título do Serviço *</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Limpeza completa da casa"
                      className={`input input-bordered w-full ${
                        errors.title ? 'input-error' : ''
                      }`}
                      {...register('title', {
                        required: 'Título é obrigatório',
                        minLength: {
                          value: 5,
                          message: 'Título deve ter pelo menos 5 caracteres'
                        }
                      })}
                    />
                    {errors.title && (
                      <label className="label">
                        <span className="label-text-alt text-error">
                          {errors.title.message}
                        </span>
                      </label>
                    )}
                  </div>

                  {/* Description */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Descrição Detalhada *</span>
                    </label>
                    <textarea
                      placeholder="Descreva detalhadamente o serviço que você precisa..."
                      className={`textarea textarea-bordered h-32 ${
                        errors.description ? 'textarea-error' : ''
                      }`}
                      {...register('description', {
                        required: 'Descrição é obrigatória',
                        minLength: {
                          value: 20,
                          message: 'Descrição deve ter pelo menos 20 caracteres'
                        }
                      })}
                    ></textarea>
                    {errors.description && (
                      <label className="label">
                        <span className="label-text-alt text-error">
                          {errors.description.message}
                        </span>
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Service Details */}
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h2 className="card-title mb-4">Detalhes do Serviço</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Categoria *</span>
                      </label>
                      <select
                        className={`select select-bordered w-full ${
                          errors.category ? 'select-error' : ''
                        }`}
                        {...register('category', {
                          required: 'Categoria é obrigatória'
                        })}
                      >
                        <option value="">Selecione uma categoria</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      {errors.category && (
                        <label className="label">
                          <span className="label-text-alt text-error">
                            {errors.category.message}
                          </span>
                        </label>
                      )}
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Prioridade *</span>
                      </label>
                      <select
                        className={`select select-bordered w-full ${
                          errors.priority ? 'select-error' : ''
                        }`}
                        {...register('priority', {
                          required: 'Prioridade é obrigatória'
                        })}
                      >
                        <option value="">Selecione a prioridade</option>
                        <option value="low">Baixa</option>
                        <option value="medium">Média</option>
                        <option value="high">Alta</option>
                        <option value="urgent">Urgente</option>
                      </select>
                      {errors.priority && (
                        <label className="label">
                          <span className="label-text-alt text-error">
                            {errors.priority.message}
                          </span>
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Budget */}
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h2 className="card-title mb-4">Orçamento</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Orçamento Mínimo (R$) *</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className={`input input-bordered w-full ${
                          errors.budget_min ? 'input-error' : ''
                        }`}
                        {...register('budget_min', {
                          required: 'Orçamento mínimo é obrigatório',
                          min: {
                            value: 0.01,
                            message: 'Orçamento deve ser maior que zero'
                          }
                        })}
                      />
                      {errors.budget_min && (
                        <label className="label">
                          <span className="label-text-alt text-error">
                            {errors.budget_min.message}
                          </span>
                        </label>
                      )}
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Orçamento Máximo (R$) *</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className={`input input-bordered w-full ${
                          errors.budget_max ? 'input-error' : ''
                        }`}
                        {...register('budget_max', {
                          required: 'Orçamento máximo é obrigatório',
                          min: {
                            value: 0.01,
                            message: 'Orçamento deve ser maior que zero'
                          }
                        })}
                      />
                      {errors.budget_max && (
                        <label className="label">
                          <span className="label-text-alt text-error">
                            {errors.budget_max.message}
                          </span>
                        </label>
                      )}
                    </div>
                  </div>

                  {budgetMin && budgetMax && parseFloat(budgetMin) >= parseFloat(budgetMax) && (
                    <div className="alert alert-warning mt-4">
                      <ExclamationTriangleIcon className="h-5 w-5" />
                      <span>O orçamento máximo deve ser maior que o mínimo</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h2 className="card-title mb-4">Localização</h2>
                  
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Endereço Completo *</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Rua, número, bairro, cidade - estado"
                      className={`input input-bordered w-full ${
                        errors.address ? 'input-error' : ''
                      }`}
                      {...register('address', {
                        required: 'Endereço é obrigatório',
                        minLength: {
                          value: 10,
                          message: 'Endereço deve ter pelo menos 10 caracteres'
                        }
                      })}
                    />
                    {errors.address && (
                      <label className="label">
                        <span className="label-text-alt text-error">
                          {errors.address.message}
                        </span>
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h2 className="card-title mb-4">Imagens (Opcional)</h2>
                  
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Adicionar Imagens</span>
                      <span className="label-text-alt">Máximo 5 imagens</span>
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="file-input file-input-bordered w-full"
                      disabled={selectedImages.length >= 5}
                    />
                  </div>

                  {selectedImages.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-base-content/70 mb-2">
                        Imagens selecionadas ({selectedImages.length}/5):
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {selectedImages.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 btn btn-circle btn-xs btn-error"
                            >
                              <XMarkIcon className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h2 className="card-title mb-4">Informações Adicionais</h2>
                  
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Observações</span>
                    </label>
                    <textarea
                      placeholder="Informações adicionais, requisitos especiais, etc..."
                      className="textarea textarea-bordered"
                      {...register('additional_info')}
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <div className="flex flex-col sm:flex-row gap-4 justify-end">
                    <Link to={`/requests/${id}`} className="btn btn-ghost">
                      Cancelar
                    </Link>
                    <button
                      type="submit"
                      className={`btn btn-primary ${
                        isLoading ? 'loading' : ''
                      }`}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card bg-base-100 shadow-lg sticky top-6">
              <div className="card-body">
                <h3 className="card-title text-lg mb-4">💡 Dicas para edição</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Mantenha o título claro e objetivo</span>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Atualize a descrição se necessário</span>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Revise o orçamento se mudou de ideia</span>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Confirme se o endereço está correto</span>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Adicione imagens se ajudar a explicar</span>
                  </div>
                </div>

                <div className="divider"></div>
                
                <div className="alert alert-info">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <div className="text-xs">
                    <p className="font-semibold">Importante:</p>
                    <p>Alterações só são permitidas enquanto a solicitação estiver pendente.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditServiceRequest