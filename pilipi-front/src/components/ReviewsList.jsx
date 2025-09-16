import React, { useState, useEffect } from 'react';
import {
  StarIcon,
  UserIcon,
  CalendarIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

const ReviewsList = ({ userId, userType, showTitle = true }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    }
  });

  useEffect(() => {
    fetchReviews();
    fetchReviewStats();
  }, [userId, pagination.page]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      
      let response;
      if (userType === 'provider') {
        response = await apiService.reviews.getByProvider(userId);
      } else {
        // Para clientes, buscar avaliações que eles fizeram
        response = await apiService.reviews.getMyReviews();
      }
      
      setReviews(response.data.results || response.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.count || response.data.length || 0,
        totalPages: Math.ceil((response.data.count || response.data.length || 0) / pagination.limit)
      }));
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
      toast.error('Erro ao carregar avaliações');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewStats = async () => {
    try {
      const response = await apiService.reviews.getReviewStats(userId);
      setStats(response.data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas de avaliações:', error);
      // Se não conseguir carregar stats, calcular localmente
      if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const avgRating = totalRating / reviews.length;
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(review => {
          distribution[review.rating]++;
        });
        setStats({
          averageRating: avgRating,
          totalReviews: reviews.length,
          ratingDistribution: distribution
        });
      }
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          star <= rating ? (
            <StarIconSolid key={star} className="w-4 h-4 text-warning" />
          ) : (
            <StarIcon key={star} className="w-4 h-4 text-base-content/30" />
          )
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRatingPercentage = (rating) => {
    if (stats.totalReviews === 0) return 0;
    return Math.round((stats.ratingDistribution[rating] / stats.totalReviews) * 100);
  };

  return (
    <div className="space-y-6">
      {showTitle && (
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-base-content">
            Avaliações
          </h3>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {stats.averageRating.toFixed(1)}
            </div>
            <div className="text-sm text-base-content/70">
              {stats.totalReviews} avaliações
            </div>
          </div>
        </div>
      )}

      {/* Rating Summary */}
      {stats.totalReviews > 0 && (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Overall Rating */}
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {stats.averageRating.toFixed(1)}
                </div>
                <div className="flex justify-center mb-2">
                  {renderStars(Math.round(stats.averageRating))}
                </div>
                <div className="text-sm text-base-content/70">
                  Baseado em {stats.totalReviews} avaliações
                </div>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-sm w-8">{rating}</span>
                    <StarIconSolid className="w-4 h-4 text-warning" />
                    <div className="flex-1 bg-base-200 rounded-full h-2">
                      <div 
                        className="bg-warning h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getRatingPercentage(rating)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-base-content/70 w-12">
                      {getRatingPercentage(rating)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="card bg-base-100 shadow-sm">
              <div className="card-body p-6">
                <div className="flex items-start gap-4">
                  {/* Reviewer Avatar */}
                  <div className="avatar placeholder flex-shrink-0">
                    <div className="bg-primary text-primary-content rounded-full w-12">
                      <span className="text-sm font-semibold">
                        {review.reviewer?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h4 className="font-semibold text-base-content">
                          {review.reviewer?.name || 'Usuário'}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-base-content/70">
                          <UserIcon className="w-4 h-4" />
                          <span>
                            {review.reviewer?.userType === 'client' ? 'Cliente' : 'Prestador'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          {renderStars(review.rating)}
                          <span className="text-sm font-medium ml-1">
                            {review.rating}/5
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-base-content/60">
                          <CalendarIcon className="w-3 h-3" />
                          <span>{formatDate(review.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Service Info */}
                    {review.job?.serviceRequest && (
                      <div className="bg-base-200 rounded-lg p-3 mb-3">
                        <div className="text-sm">
                          <span className="font-medium">Serviço:</span> {review.job.serviceRequest.title}
                        </div>
                        {review.job.serviceRequest.category && (
                          <div className="text-sm text-base-content/70">
                            <span className="font-medium">Categoria:</span> {review.job.serviceRequest.category.name}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Comment */}
                    {review.comment && (
                      <div className="flex items-start gap-2">
                        <ChatBubbleLeftIcon className="w-4 h-4 text-base-content/60 mt-0.5 flex-shrink-0" />
                        <p className="text-base-content/80 text-sm leading-relaxed">
                          {review.comment}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <StarIcon className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
          <h3 className="text-lg font-semibold text-base-content mb-2">
            Nenhuma avaliação ainda
          </h3>
          <p className="text-base-content/70">
            {userType === 'provider' 
              ? 'Complete alguns trabalhos para receber suas primeiras avaliações.'
              : 'Contrate alguns serviços para receber suas primeiras avaliações.'
            }
          </p>
        </div>
      )}

      {/* Pagination */}
      {!loading && reviews.length > 0 && pagination.totalPages > 1 && (
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

export default ReviewsList;