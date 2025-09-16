from rest_framework import generics, status, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q, Avg, Count, Sum
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from .models import ServiceRequest, ServiceAssignment, ServiceReview, Notification
from accounts.models import ProviderProfile
from .serializers import (
    ServiceRequestSerializer,
    ServiceRequestCreateSerializer,
    ServiceRequestListSerializer,
    ServiceAssignmentSerializer,
    ServiceAssignmentCreateSerializer,
    ServiceReviewSerializer,
    ServiceReviewCreateSerializer,
    NotificationSerializer,
    NotificationUpdateSerializer,
    ServiceStatisticsSerializer,
    ProviderStatisticsSerializer
)
from .whatsapp_service import whatsapp_service
import logging

logger = logging.getLogger(__name__)


class ServiceRequestListCreateView(generics.ListCreateAPIView):
    """View para listar e criar solicitações de serviço"""
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'status', 'priority', 'city', 'state']
    search_fields = ['title', 'description', 'city']
    ordering_fields = ['created_at', 'budget_min', 'budget_max', 'preferred_date']
    ordering = ['-created_at']
    
    def perform_create(self, serializer):
        """Override to add logging and WhatsApp notifications"""
        print(f"=== SERVICE REQUEST CREATION DEBUG ===")
        print(f"Request data: {dict(self.request.data)}")
        print(f"User: {self.request.user}")
        print(f"User authenticated: {self.request.user.is_authenticated}")
        try:
            # Salva a solicitação
            service_request = serializer.save()
            print(f"Service request created successfully: {service_request.id}")
            
            # Envia notificações WhatsApp para prestadores da categoria
            self.send_whatsapp_notifications(service_request)
            
        except Exception as e:
            print(f"Error creating service request: {e}")
            print(f"Serializer errors: {serializer.errors}")
            raise
    
    def send_whatsapp_notifications(self, service_request):
        """Envia notificações WhatsApp para prestadores da categoria"""
        try:
            # Busca prestadores ativos da mesma categoria e cidade
            providers = ProviderProfile.objects.filter(
                service_categories=service_request.category,
                user__is_active=True,
                user__phone_number__isnull=False
            ).exclude(user__phone_number='')
            
            # Se não encontrar prestadores na mesma cidade, busca em todo o estado
            if not providers.exists():
                providers = ProviderProfile.objects.filter(
                    service_categories=service_request.category,
                    user__is_active=True,
                    user__phone_number__isnull=False
                ).exclude(user__phone_number='')
            
            print(f"📱 Enviando WhatsApp para {providers.count()} prestadores...")
            
            # Envia WhatsApp para cada prestador
            for provider in providers:
                try:
                    success = whatsapp_service.send_service_request_notification(
                        provider.user.phone_number,
                        service_request
                    )
                    if success:
                        print(f"✅ WhatsApp enviado para {provider.user.get_full_name()} ({provider.user.phone_number})")
                    else:
                        print(f"❌ Falha ao enviar WhatsApp para {provider.user.get_full_name()}")
                except Exception as e:
                    print(f"❌ Erro ao enviar WhatsApp para {provider.user.get_full_name()}: {str(e)}")
                    
        except Exception as e:
            print(f"❌ Erro geral no envio de WhatsApp: {str(e)}")
            logger.error(f"Erro ao enviar notificações WhatsApp: {str(e)}")
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ServiceRequestCreateSerializer
        return ServiceRequestListSerializer
    
    def post(self, request, *args, **kwargs):
        """Override post method for debugging"""
        print(f"=== POST METHOD DEBUG ===")
        print(f"Request data: {dict(request.data)}")
        print(f"User: {request.user}")
        print(f"User authenticated: {request.user.is_authenticated}")
        print(f"User type: {getattr(request.user, 'user_type', 'No user_type')}")
        return super().post(request, *args, **kwargs)
    
    def get_queryset(self):
        user = self.request.user
        
        if user.user_type == 'client':
            # Clientes veem apenas suas próprias solicitações
            return ServiceRequest.objects.filter(client=user)
        elif user.user_type == 'provider':
            # Prestadores veem solicitações abertas e suas próprias propostas
            return ServiceRequest.objects.filter(
                Q(status='open') | Q(serviceassignment__provider__user=user)
            ).distinct()
        else:
            # Administradores veem todas
            return ServiceRequest.objects.all()
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        
        # Paginação
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response({
                'results': serializer.data,
                'total': queryset.count(),
                'totalPages': self.paginator.page.paginator.num_pages if hasattr(self.paginator, 'page') else 1
            })
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'results': serializer.data,
            'total': queryset.count(),
            'totalPages': 1
        })


class ServiceRequestDetailView(generics.RetrieveUpdateDestroyAPIView):
    """View para detalhes de solicitação de serviço"""
    serializer_class = ServiceRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.user_type == 'client':
            return ServiceRequest.objects.filter(client=user)
        elif user.user_type == 'provider':
            return ServiceRequest.objects.filter(
                Q(status='open') | Q(serviceassignment__provider__user=user)
            ).distinct()
        else:
            return ServiceRequest.objects.all()
    
    def perform_update(self, serializer):
        # Apenas o cliente pode atualizar sua solicitação
        if self.request.user != serializer.instance.client:
            return Response(
                {'error': 'Apenas o cliente pode atualizar esta solicitação.'},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer.save()
    
    def perform_destroy(self, instance):
        # Apenas o cliente pode deletar sua solicitação se estiver aberta
        if self.request.user != instance.client:
            return Response(
                {'error': 'Apenas o cliente pode deletar esta solicitação.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if instance.status != 'open':
            return Response(
                {'error': 'Apenas solicitações abertas podem ser deletadas.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        instance.delete()


class ServiceAssignmentListCreateView(generics.ListCreateAPIView):
    """View para listar e criar propostas de serviço"""
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'service_request']
    ordering_fields = ['created_at', 'proposed_price']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ServiceAssignmentCreateSerializer
        return ServiceAssignmentSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        if user.user_type == 'client':
            # Clientes veem propostas para suas solicitações
            return ServiceAssignment.objects.filter(service_request__client=user)
        elif user.user_type == 'provider':
            # Prestadores veem apenas suas próprias propostas
            return ServiceAssignment.objects.filter(provider__user=user)
        else:
            return ServiceAssignment.objects.all()


class ServiceAssignmentDetailView(generics.RetrieveUpdateAPIView):
    """View para detalhes de proposta de serviço"""
    serializer_class = ServiceAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.user_type == 'client':
            return ServiceAssignment.objects.filter(service_request__client=user)
        elif user.user_type == 'provider':
            return ServiceAssignment.objects.filter(provider__user=user)
        else:
            return ServiceAssignment.objects.all()
    
    def perform_update(self, serializer):
        user = self.request.user
        assignment = serializer.instance
        
        # Verificar permissões baseadas no tipo de usuário
        if user.user_type == 'provider' and assignment.provider.user != user:
            return Response(
                {'error': 'Você só pode atualizar suas próprias propostas.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if user.user_type == 'client' and assignment.service_request.client != user:
            return Response(
                {'error': 'Você só pode atualizar propostas para suas solicitações.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer.save()


class ServiceReviewListCreateView(generics.ListCreateAPIView):
    """View para listar e criar avaliações de serviço"""
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['rating', 'would_recommend']
    ordering_fields = ['created_at', 'rating']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ServiceReviewCreateSerializer
        return ServiceReviewSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        if user.user_type == 'client':
            # Clientes veem suas próprias avaliações
            return ServiceReview.objects.filter(reviewer=user)
        elif user.user_type == 'provider':
            # Prestadores veem avaliações de seus serviços
            return ServiceReview.objects.filter(assignment__provider__user=user)
        else:
            return ServiceReview.objects.all()


class NotificationListView(generics.ListAPIView):
    """View para listar notificações do usuário"""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['is_read', 'notification_type']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        
        # Paginação
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response({
                'notifications': serializer.data,
                'total': queryset.count(),
                'totalPages': self.paginator.page.paginator.num_pages if hasattr(self.paginator, 'page') else 1
            })
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'notifications': serializer.data,
            'total': queryset.count(),
            'totalPages': 1
        })


class NotificationDetailView(generics.RetrieveUpdateAPIView):
    """View para detalhes e atualização de notificação"""
    serializer_class = NotificationUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def accept_assignment(request, assignment_id):
    """View para aceitar uma proposta de serviço"""
    try:
        assignment = ServiceAssignment.objects.get(
            id=assignment_id,
            service_request__client=request.user
        )
    except ServiceAssignment.DoesNotExist:
        return Response(
            {'error': 'Proposta não encontrada.'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if assignment.status != 'pending':
        return Response(
            {'error': 'Esta proposta não pode mais ser aceita.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Aceitar a proposta
    assignment.status = 'accepted'
    assignment.save()
    
    # Atualizar status da solicitação
    service_request = assignment.service_request
    service_request.status = 'in_progress'
    service_request.save()
    
    # Rejeitar outras propostas
    ServiceAssignment.objects.filter(
        service_request=service_request
    ).exclude(id=assignment_id).update(status='rejected')
    
    # Criar notificação para o prestador
    Notification.objects.create(
        user=assignment.provider.user,
        title='Proposta Aceita!',
        message=f'Sua proposta para "{service_request.title}" foi aceita.',
        type='assignment_accepted',
        service_request=service_request
    )
    
    return Response({
        'message': 'Proposta aceita com sucesso!',
        'assignment': ServiceAssignmentSerializer(assignment).data
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def complete_assignment(request, assignment_id):
    """View para marcar um serviço como concluído"""
    try:
        assignment = ServiceAssignment.objects.get(
            id=assignment_id,
            provider__user=request.user
        )
    except ServiceAssignment.DoesNotExist:
        return Response(
            {'error': 'Atribuição não encontrada.'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if assignment.status != 'accepted':
        return Response(
            {'error': 'Este serviço não pode ser marcado como concluído.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Marcar como concluído
    assignment.status = 'completed'
    assignment.completion_date = timezone.now()
    assignment.save()
    
    # Atualizar status da solicitação
    service_request = assignment.service_request
    service_request.status = 'completed'
    service_request.save()
    
    # Criar notificação para o cliente
    Notification.objects.create(
        user=service_request.client,
        title='Serviço Concluído!',
        message=f'O serviço "{service_request.title}" foi marcado como concluído.',
        type='service_completed',
        service_request=service_request
    )
    
    return Response({
        'message': 'Serviço marcado como concluído!',
        'assignment': ServiceAssignmentSerializer(assignment).data
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_notifications_read(request):
    """View para marcar todas as notificações como lidas"""
    updated_count = Notification.objects.filter(
        user=request.user,
        is_read=False
    ).update(is_read=True)
    
    return Response({
        'message': f'{updated_count} notificações marcadas como lidas.'
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def service_statistics(request):
    """View para estatísticas de serviços"""
    user = request.user
    
    if user.user_type == 'client':
        # Estatísticas do cliente
        requests = ServiceRequest.objects.filter(client=user)
        
        stats = {
            'total_requests': requests.count(),
            'open_requests': requests.filter(status='open').count(),
            'in_progress_requests': requests.filter(status='in_progress').count(),
            'completed_requests': requests.filter(status='completed').count(),
            'cancelled_requests': requests.filter(status='cancelled').count(),
            'total_assignments': ServiceAssignment.objects.filter(service_request__client=user).count(),
            'average_rating': ServiceReview.objects.filter(
                assignment__service_request__client=user
            ).aggregate(avg_rating=Avg('rating'))['avg_rating'] or 0,
            'total_reviews': ServiceReview.objects.filter(
                assignment__service_request__client=user
            ).count()
        }
        
    elif user.user_type == 'provider':
        # Estatísticas do prestador
        try:
            provider_profile = ProviderProfile.objects.get(user=user)
            assignments = ServiceAssignment.objects.filter(provider=provider_profile)
            
            stats = {
                'total_proposals': assignments.count(),
                'accepted_proposals': assignments.filter(status='accepted').count(),
                'completed_services': assignments.filter(status='completed').count(),
                'average_rating': ServiceReview.objects.filter(
                    assignment__provider=provider_profile
                ).aggregate(avg_rating=Avg('rating'))['avg_rating'] or 0,
                'total_earnings': assignments.filter(
                    status='completed'
                ).aggregate(total=Sum('proposed_price'))['total'] or 0,
                'success_rate': (
                    assignments.filter(status='completed').count() / 
                    max(assignments.filter(status__in=['accepted', 'completed']).count(), 1)
                ) * 100
            }
            
            serializer = ProviderStatisticsSerializer(stats)
            
        except ProviderProfile.DoesNotExist:
            return Response(
                {'error': 'Perfil de prestador não encontrado.'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    else:
        # Estatísticas gerais para administradores
        stats = {
            'total_requests': ServiceRequest.objects.count(),
            'open_requests': ServiceRequest.objects.filter(status='open').count(),
            'in_progress_requests': ServiceRequest.objects.filter(status='in_progress').count(),
            'completed_requests': ServiceRequest.objects.filter(status='completed').count(),
            'cancelled_requests': ServiceRequest.objects.filter(status='cancelled').count(),
            'total_assignments': ServiceAssignment.objects.count(),
            'average_rating': ServiceReview.objects.aggregate(
                avg_rating=Avg('rating')
            )['avg_rating'] or 0,
            'total_reviews': ServiceReview.objects.count()
        }
    
    if user.user_type != 'provider':
        serializer = ServiceStatisticsSerializer(stats)
    
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def provider_reviews(request, provider_id):
    """View para listar avaliações de um prestador específico"""
    logger.info(f"Getting reviews for provider {provider_id}")
    
    try:
        provider_profile = ProviderProfile.objects.get(id=provider_id)
        reviews = ServiceReview.objects.filter(assignment__provider=provider_profile)
        
        serializer = ServiceReviewSerializer(reviews, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except ProviderProfile.DoesNotExist:
        logger.error(f"Provider profile {provider_id} not found")
        return Response(
            {'error': 'Prestador não encontrado.'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error getting provider reviews: {str(e)}")
        return Response(
            {'error': 'Erro ao buscar avaliações.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def provider_review_stats(request, provider_id):
    """View para estatísticas de avaliações de um prestador específico"""
    logger.info(f"Getting review stats for provider {provider_id}")
    
    try:
        provider_profile = ProviderProfile.objects.get(id=provider_id)
        reviews = ServiceReview.objects.filter(assignment__provider=provider_profile)
        
        stats = {
            'total_reviews': reviews.count(),
            'average_rating': reviews.aggregate(avg_rating=Avg('rating'))['avg_rating'] or 0,
            'rating_distribution': {
                '5': reviews.filter(rating=5).count(),
                '4': reviews.filter(rating=4).count(),
                '3': reviews.filter(rating=3).count(),
                '2': reviews.filter(rating=2).count(),
                '1': reviews.filter(rating=1).count(),
            },
            'recommendation_rate': (
                reviews.filter(would_recommend=True).count() / 
                max(reviews.count(), 1)
            ) * 100
        }
        
        return Response(stats, status=status.HTTP_200_OK)
        
    except ProviderProfile.DoesNotExist:
        logger.error(f"Provider profile {provider_id} not found")
        return Response(
            {'error': 'Prestador não encontrado.'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error getting provider review stats: {str(e)}")
        return Response(
            {'error': 'Erro ao buscar estatísticas de avaliações.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
