import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  StarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import { apiService } from '../services/api';

const ReviewModal = ({ 
  isOpen, 
  onClose, 
  jobId, 
  revieweeId, 
  revieweeName, 
  revieweeType, // 'client' or 'provider'
  onReviewSubmitted 
}) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const handleClose = () => {
    reset();
    setRating(0);
    setHoverRating(0);
    onClose();
  };

  const onSubmit = async (data) => {
    if (rating === 0) {
      toast.error('Por favor, selecione uma avaliação');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const reviewData = {
        ...data,
        rating,
        job: jobId,
        reviewee: revieweeId
      };

      await apiService.reviews.create(reviewData);
      
      toast.success('Avaliação enviada com sucesso!');
      
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
      
      handleClose();
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error);
      toast.error('Erro ao enviar avaliação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingText = (rating) => {
    switch (rating) {
      case 1: return 'Muito ruim';
      case 2: return 'Ruim';
      case 3: return 'Regular';
      case 4: return 'Bom';
      case 5: return 'Excelente';
      default: return 'Selecione uma avaliação';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg">
            Avaliar {revieweeType === 'client' ? 'Cliente' : 'Prestador'}
          </h3>
          <button 
            className="btn btn-sm btn-circle btn-ghost"
            onClick={handleClose}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Reviewee Info */}
        <div className="text-center mb-6">
          <div className="avatar placeholder mb-3">
            <div className="bg-primary text-primary-content rounded-full w-16">
              <span className="text-xl font-semibold">
                {revieweeName?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
          </div>
          <h4 className="font-semibold text-base-content">
            {revieweeName}
          </h4>
          <p className="text-sm text-base-content/70">
            Como foi sua experiência?
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Rating */}
          <div className="text-center">
            <label className="label">
              <span className="label-text font-medium">Avaliação</span>
            </label>
            
            <div className="flex justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= (hoverRating || rating);
                return (
                  <button
                    key={star}
                    type="button"
                    className="btn btn-ghost btn-sm p-1"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                  >
                    {isFilled ? (
                      <StarIconSolid className="w-8 h-8 text-warning" />
                    ) : (
                      <StarIcon className="w-8 h-8 text-base-content/30" />
                    )}
                  </button>
                );
              })}
            </div>
            
            <p className="text-sm text-base-content/70">
              {getRatingText(hoverRating || rating)}
            </p>
          </div>

          {/* Comment */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Comentário</span>
              <span className="label-text-alt text-base-content/60">Opcional</span>
            </label>
            <textarea 
              className="textarea textarea-bordered h-24 resize-none"
              placeholder="Conte como foi sua experiência..."
              {...register('comment', {
                maxLength: {
                  value: 500,
                  message: 'Comentário deve ter no máximo 500 caracteres'
                }
              })}
            />
            {errors.comment && (
              <label className="label">
                <span className="label-text-alt text-error">
                  {errors.comment.message}
                </span>
              </label>
            )}
          </div>

          {/* Actions */}
          <div className="modal-action">
            <button 
              type="button"
              className="btn btn-ghost"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || rating === 0}
            >
              {isSubmitting && <span className="loading loading-spinner loading-sm"></span>}
              Enviar Avaliação
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;