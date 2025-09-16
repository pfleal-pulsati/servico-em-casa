from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import ServiceRequest, ServiceAssignment, ServiceReview, Notification
from accounts.models import ServiceCategory, ProviderProfile
from accounts.serializers import UserProfileSerializer, ProviderProfileSerializer

User = get_user_model()


class ServiceRequestSerializer(serializers.ModelSerializer):
    """Serializer para solicitações de serviço"""
    client = UserProfileSerializer(read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    
    class Meta:
        model = ServiceRequest
        fields = [
            'id', 'client', 'category', 'category_name', 'title', 'description',
            'address', 'city', 'state', 'preferred_date', 'budget_min', 'budget_max', 'priority',
            'priority_display', 'status', 'status_display', 'images', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'client', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        # Definir o cliente como o usuário autenticado
        validated_data['client'] = self.context['request'].user
        return super().create(validated_data)
    
    def validate_category(self, value):
        """Validar se a categoria está ativa"""
        if not value.is_active:
            raise serializers.ValidationError("Esta categoria não está disponível.")
        return value
    
    def validate_budget_min(self, value):
        """Validar se o orçamento mínimo é positivo"""
        if value and value <= 0:
            raise serializers.ValidationError("O orçamento mínimo deve ser maior que zero.")
        return value
    
    def validate_budget_max(self, value):
        """Validar se o orçamento máximo é positivo"""
        if value and value <= 0:
            raise serializers.ValidationError("O orçamento máximo deve ser maior que zero.")
        return value


class ServiceRequestCreateSerializer(ServiceRequestSerializer):
    """Serializer específico para criação de solicitações"""
    
    class Meta(ServiceRequestSerializer.Meta):
        fields = [
            'id', 'category', 'title', 'description', 'address', 'city', 'state',
            'preferred_date', 'budget_min', 'budget_max', 'priority', 'images'
        ]


class ServiceRequestListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listagem de solicitações"""
    client_name = serializers.CharField(source='client.get_full_name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = ServiceRequest
        fields = [
            'id', 'client_name', 'category_name', 'title', 'city', 'state',
            'budget_min', 'budget_max', 'status', 'status_display', 'created_at'
        ]


class ServiceAssignmentSerializer(serializers.ModelSerializer):
    """Serializer para atribuições de serviço"""
    service_request = ServiceRequestSerializer(read_only=True)
    provider = ProviderProfileSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = ServiceAssignment
        fields = [
            'id', 'service_request', 'provider', 'proposed_price', 'estimated_duration',
            'status', 'status_display', 'notes', 'start_date', 'completion_date',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_proposed_price(self, value):
        """Validar se o preço proposto é positivo"""
        if value <= 0:
            raise serializers.ValidationError("O preço proposto deve ser maior que zero.")
        return value
    
    def validate_estimated_duration(self, value):
        """Validar se a duração estimada é positiva"""
        if value <= 0:
            raise serializers.ValidationError("A duração estimada deve ser maior que zero.")
        return value


class ServiceAssignmentCreateSerializer(serializers.ModelSerializer):
    """Serializer para criação de propostas de serviço"""
    
    class Meta:
        model = ServiceAssignment
        fields = ['service_request', 'proposed_price', 'estimated_duration', 'notes']
    
    def create(self, validated_data):
        # Obter o perfil do prestador do usuário autenticado
        user = self.context['request'].user
        try:
            provider_profile = ProviderProfile.objects.get(user=user)
        except ProviderProfile.DoesNotExist:
            raise serializers.ValidationError("Usuário não possui perfil de prestador.")
        
        validated_data['provider'] = provider_profile
        return super().create(validated_data)
    
    def validate_service_request(self, value):
        """Validar se a solicitação está disponível para propostas"""
        if value.status != 'open':
            raise serializers.ValidationError("Esta solicitação não está mais disponível para propostas.")
        
        # Verificar se o prestador já fez uma proposta
        user = self.context['request'].user
        try:
            provider_profile = ProviderProfile.objects.get(user=user)
            if ServiceAssignment.objects.filter(
                service_request=value,
                provider=provider_profile
            ).exists():
                raise serializers.ValidationError("Você já fez uma proposta para esta solicitação.")
        except ProviderProfile.DoesNotExist:
            raise serializers.ValidationError("Usuário não possui perfil de prestador.")
        
        return value


class ServiceReviewSerializer(serializers.ModelSerializer):
    """Serializer para avaliações de serviço"""
    assignment = ServiceAssignmentSerializer(read_only=True)
    reviewer = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = ServiceReview
        fields = [
            'id', 'assignment', 'reviewer', 'rating', 'comment', 'would_recommend',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'reviewer', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        # Definir o avaliador como o usuário autenticado
        validated_data['reviewer'] = self.context['request'].user
        return super().create(validated_data)
    
    def validate_assignment(self, value):
        """Validar se o serviço foi concluído e se o usuário pode avaliar"""
        if value.status != 'completed':
            raise serializers.ValidationError("Só é possível avaliar serviços concluídos.")
        
        user = self.context['request'].user
        # Verificar se o usuário é o cliente da solicitação
        if value.service_request.client != user:
            raise serializers.ValidationError("Apenas o cliente pode avaliar este serviço.")
        
        # Verificar se já existe uma avaliação
        if ServiceReview.objects.filter(assignment=value, reviewer=user).exists():
            raise serializers.ValidationError("Você já avaliou este serviço.")
        
        return value
    
    def validate_rating(self, value):
        """Validar se a classificação está no intervalo correto"""
        if not (1 <= value <= 5):
            raise serializers.ValidationError("A classificação deve estar entre 1 e 5.")
        return value


class ServiceReviewCreateSerializer(ServiceReviewSerializer):
    """Serializer específico para criação de avaliações"""
    
    class Meta(ServiceReviewSerializer.Meta):
        fields = ['assignment', 'rating', 'comment', 'would_recommend']


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer para notificações"""
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id', 'title', 'message', 'type', 'type_display', 'is_read',
            'service_request', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class NotificationUpdateSerializer(serializers.ModelSerializer):
    """Serializer para atualizar status de notificações"""
    
    class Meta:
        model = Notification
        fields = ['is_read']


class ServiceStatisticsSerializer(serializers.Serializer):
    """Serializer para estatísticas de serviços"""
    total_requests = serializers.IntegerField()
    open_requests = serializers.IntegerField()
    in_progress_requests = serializers.IntegerField()
    completed_requests = serializers.IntegerField()
    cancelled_requests = serializers.IntegerField()
    total_assignments = serializers.IntegerField()
    average_rating = serializers.DecimalField(max_digits=3, decimal_places=2)
    total_reviews = serializers.IntegerField()


class ProviderStatisticsSerializer(serializers.Serializer):
    """Serializer para estatísticas de prestadores"""
    total_proposals = serializers.IntegerField()
    accepted_proposals = serializers.IntegerField()
    completed_services = serializers.IntegerField()
    average_rating = serializers.DecimalField(max_digits=3, decimal_places=2)
    total_earnings = serializers.DecimalField(max_digits=10, decimal_places=2)
    success_rate = serializers.DecimalField(max_digits=5, decimal_places=2)