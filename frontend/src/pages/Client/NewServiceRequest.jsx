import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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

const NewServiceRequest = () => {
  const { user } = useAuth()
  const [categories, setCategories] = useState([])
  const [selectedImages, setSelectedImages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch
  } = useForm()

  const budgetMin = watch('budget_min')
  const budgetMax = watch('budget_max')

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await apiService.getCategories()
      setCategories(response.results || [])
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
      toast.error('Erro ao carregar categorias')
    }
  }

  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files)
    if (selectedImages.length + files.length > 5) {
      toast.error('Máximo de 5 imagens permitidas')
      return
    }

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast.error('Imagem muito grande. Máximo 5MB por imagem.')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImages(prev => [...prev, {
          file,
          preview: e.target.result,
          id: Date.now() + Math.random()
        }])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (id) => {
    setSelectedImages(prev => prev.filter(img => img.id !== id))
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      // Validate budget
      if (parseFloat(data.budget_min) > parseFloat(data.budget_max)) {
        setError('budget_max', { message: 'Orçamento máximo deve ser maior que o mínimo' })
        setIsLoading(false)
        return
      }

      // Create FormData for file upload
      const formData = new FormData()
      formData.append('title', data.title)
      formData.append('description', data.description)
      formData.append('category', data.category)
      formData.append('priority', data.priority)
      formData.append('budget_min', data.budget_min)
      formData.append('budget_max', data.budget_max)
      // Only add preferred_date if it has a value
      if (data.preferred_date && data.preferred_date.trim() !== '') {
        formData.append('preferred_date', data.preferred_date)
      }
      formData.append('address', data.address)
      formData.append('city', 'São Paulo') // Temporary hardcoded value
      formData.append('state', 'SP') // Temporary hardcoded value
      // Note: client is automatically set by the backend from authenticated user
      formData.append('additional_info', data.additional_info || '')

      // Add images
      selectedImages.forEach((img, index) => {
        formData.append(`images`, img.file)
      })

      const response = await apiService.createServiceRequest(formData)
      
      console.log('Response from API:', response)
      console.log('Response data:', response.data)
      console.log('Response ID:', response.id)
      
      toast.success('Solicitação criada com sucesso!')
      
      // Check if ID is in response.data or directly in response
      const serviceId = response.data?.id || response.id
      
      if (serviceId) {
        navigate(`/requests/${serviceId}`)
      } else {
        console.error('No ID in response, navigating to service requests list')
        navigate('/requests')
      }
    } catch (error) {
      console.error('Erro ao criar solicitação:', error)
      if (error.response?.data) {
        Object.keys(error.response.data).forEach(key => {
          setError(key, { message: error.response.data[key][0] })
        })
      } else {
        toast.error('Erro ao criar solicitação')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <div className="breadcrumbs text-sm mb-6">
          <ul>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/requests">Solicitações</Link></li>
            <li>Nova Solicitação</li>
          </ul>
        </div>
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Nova Solicitação de Serviço</h1>
          <p className="text-base-content/70">
            Descreva o serviço que você precisa e receba propostas de profissionais qualificados.
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

                  {/* Category and Priority */}
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
                        {categories && categories.map((category) => (
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

              {/* Budget and Date */}
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h2 className="card-title mb-4 flex items-center gap-2">
                    <CurrencyDollarIcon className="h-5 w-5" />
                    Orçamento e Data
                  </h2>
                  
                  {/* Budget */}
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
                        min={budgetMin || "0"}
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

                  {/* Preferred Date */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Data Preferencial</span>
                    </label>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      className={`input input-bordered w-full ${
                        errors.preferred_date ? 'input-error' : ''
                      }`}
                      {...register('preferred_date')}
                    />
                    <label className="label">
                      <span className="label-text-alt">Deixe em branco se não tiver preferência</span>
                    </label>
                  </div>
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
                    <textarea
                      placeholder="Digite o endereço completo onde o serviço será realizado..."
                      className={`textarea textarea-bordered ${
                        errors.address ? 'textarea-error' : ''
                      }`}
                      {...register('address', {
                        required: 'Endereço é obrigatório'
                      })}
                    ></textarea>
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
                  <h2 className="card-title mb-4 flex items-center gap-2">
                    <PhotoIcon className="h-5 w-5" />
                    Imagens (Opcional)
                  </h2>
                  
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Adicionar Imagens</span>
                      <span className="label-text-alt">Máximo 5 imagens, 5MB cada</span>
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="file-input file-input-bordered w-full"
                      onChange={handleImageSelect}
                      disabled={selectedImages.length >= 5}
                    />
                  </div>

                  {/* Image Preview */}
                  {selectedImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
                      {selectedImages.map((img) => (
                        <div key={img.id} className="relative">
                          <img
                            src={img.preview}
                            alt="Preview"
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(img.id)}
                            className="absolute -top-2 -right-2 btn btn-sm btn-circle btn-error"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Info */}
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
                    <Link to="/service-requests" className="btn btn-ghost">
                      Cancelar
                    </Link>
                    <button
                      type="submit"
                      className={`btn btn-primary ${
                        isLoading ? 'loading' : ''
                      }`}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Criando...' : 'Criar Solicitação'}
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
                <h3 className="card-title text-lg mb-4">💡 Dicas para uma boa solicitação</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="badge badge-primary badge-sm mt-1">1</div>
                    <div>
                      <h4 className="font-semibold text-sm">Seja específico</h4>
                      <p className="text-xs text-base-content/70">
                        Descreva detalhadamente o que você precisa
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="badge badge-primary badge-sm mt-1">2</div>
                    <div>
                      <h4 className="font-semibold text-sm">Adicione imagens</h4>
                      <p className="text-xs text-base-content/70">
                        Fotos ajudam os profissionais a entender melhor
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="badge badge-primary badge-sm mt-1">3</div>
                    <div>
                      <h4 className="font-semibold text-sm">Orçamento realista</h4>
                      <p className="text-xs text-base-content/70">
                        Defina um orçamento justo para atrair bons profissionais
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="badge badge-primary badge-sm mt-1">4</div>
                    <div>
                      <h4 className="font-semibold text-sm">Endereço completo</h4>
                      <p className="text-xs text-base-content/70">
                        Inclua referências para facilitar a localização
                      </p>
                    </div>
                  </div>
                </div>

                <div className="alert alert-info mt-6">
                  <ExclamationTriangleIcon className="h-5 w-5" />
                  <div className="text-sm">
                    <strong>Importante:</strong> Após criar a solicitação, você receberá propostas de profissionais interessados.
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

export default NewServiceRequest