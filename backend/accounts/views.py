from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import logout
from django.shortcuts import get_object_or_404
from .models import User, ServiceCategory, ProviderProfile
from .serializers import (
    CustomTokenObtainPairSerializer,
    UserRegistrationSerializer,
    UserProfileSerializer,
    ServiceCategorySerializer,
    ProviderProfileSerializer,
    PasswordChangeSerializer,
    MasterPanelUserSerializer
)


class CustomTokenObtainPairView(TokenObtainPairView):
    """View customizada para login com JWT"""
    serializer_class = CustomTokenObtainPairSerializer


class UserRegistrationView(generics.CreateAPIView):
    """View para registro de novos usuários"""
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Gerar tokens JWT para o usuário recém-criado
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserProfileSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'message': 'Usuário criado com sucesso!'
        }, status=status.HTTP_201_CREATED)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """View para visualizar e atualizar perfil do usuário"""
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class ServiceCategoryListView(generics.ListAPIView):
    """View para listar categorias de serviço ativas"""
    queryset = ServiceCategory.objects.filter(is_active=True)
    serializer_class = ServiceCategorySerializer
    permission_classes = [permissions.AllowAny]


class ProviderProfileView(generics.RetrieveUpdateAPIView):
    """View para perfil de prestador de serviço"""
    serializer_class = ProviderProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        # Verificar se o usuário é um prestador
        if self.request.user.user_type != 'provider':
            return Response(
                {'error': 'Apenas prestadores de serviço podem acessar este perfil.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Criar perfil se não existir
        provider_profile, created = ProviderProfile.objects.get_or_create(
            user=self.request.user
        )
        return provider_profile


class ProviderProfileCreateView(generics.CreateAPIView):
    """View para criar perfil de prestador de serviço"""
    serializer_class = ProviderProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        # Verificar se o usuário é um prestador
        if self.request.user.user_type != 'provider':
            return Response(
                {'error': 'Apenas prestadores de serviço podem criar este perfil.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Verificar se já existe um perfil
        if ProviderProfile.objects.filter(user=self.request.user).exists():
            return Response(
                {'error': 'Perfil de prestador já existe para este usuário.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer.save(user=self.request.user)


class ProviderListView(generics.ListAPIView):
    """View para listar prestadores de serviço disponíveis"""
    serializer_class = ProviderProfileSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        queryset = ProviderProfile.objects.filter(
            user__is_active=True,
            is_available=True
        ).select_related('user').prefetch_related('service_categories')
        
        # Filtrar por categoria se fornecida
        category_id = self.request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(service_categories__id=category_id)
        
        # Filtrar por cidade se fornecida
        city = self.request.query_params.get('city')
        if city:
            queryset = queryset.filter(user__city__icontains=city)
        
        return queryset.distinct()


class PasswordChangeView(generics.GenericAPIView):
    """View para mudança de senha"""
    serializer_class = PasswordChangeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response({
            'message': 'Senha alterada com sucesso!'
        }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    """View para logout do usuário"""
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        
        logout(request)
        return Response({
            'message': 'Logout realizado com sucesso!'
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'error': 'Erro ao realizar logout.'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_info_view(request):
    """View para obter informações do usuário logado"""
    serializer = UserProfileSerializer(request.user)
    
    response_data = {
        'user': serializer.data
    }
    
    # Adicionar informações do perfil de prestador se aplicável
    if request.user.user_type == 'provider':
        try:
            provider_profile = ProviderProfile.objects.get(user=request.user)
            provider_serializer = ProviderProfileSerializer(provider_profile)
            response_data['provider_profile'] = provider_serializer.data
        except ProviderProfile.DoesNotExist:
            response_data['provider_profile'] = None
    
    return Response(response_data, status=status.HTTP_200_OK)


class ServiceCategoryListView(generics.ListAPIView):
    """View para listar categorias de serviço"""
    queryset = ServiceCategory.objects.filter(is_active=True)
    serializer_class = ServiceCategorySerializer
    permission_classes = [permissions.AllowAny]


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def master_panel_view(request):
    """View para painel master - apenas para usuário admin"""
    # Verificar se o usuário é admin
    if not (request.user.username == 'admin' and request.user.is_staff):
        return Response({
            'error': 'Acesso negado. Apenas usuários master podem acessar este painel.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Buscar todos os usuários
    users = User.objects.all().select_related().prefetch_related('provider_profile__service_categories')
    
    # Separar clientes e prestadores
    clients = users.filter(user_type='client')
    providers = users.filter(user_type='provider')
    
    # Serializar os dados
    clients_data = MasterPanelUserSerializer(clients, many=True).data
    providers_data = MasterPanelUserSerializer(providers, many=True).data
    
    # Adicionar informações de senha (hash) para cada usuário
    for user_data in clients_data + providers_data:
        user_obj = users.get(id=user_data['id'])
        user_data['password_hash'] = user_obj.password
    
    return Response({
        'clients': clients_data,
        'providers': providers_data,
        'total_users': users.count(),
        'total_clients': clients.count(),
        'total_providers': providers.count()
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def admin_change_user_password(request):
    """View para admin alterar senha de qualquer usuário"""
    # Verificar se o usuário é admin
    if not (request.user.username == 'admin' and request.user.is_staff):
        return Response({
            'error': 'Acesso negado. Apenas usuários master podem alterar senhas.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    user_id = request.data.get('user_id')
    new_password = request.data.get('new_password')
    
    if not user_id or not new_password:
        return Response({
            'error': 'user_id e new_password são obrigatórios.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({
            'error': 'Usuário não encontrado.'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Validar senha (mínimo 8 caracteres)
    if len(new_password) < 8:
        return Response({
            'error': 'A senha deve ter pelo menos 8 caracteres.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Alterar senha e marcar como temporária
    user.set_password(new_password)
    user.password_is_temporary = True
    user.save()
    
    return Response({
        'message': f'Senha do usuário {user.get_full_name()} alterada com sucesso. O usuário deverá alterar a senha no próximo login.',
        'user_id': user.id,
        'username': user.username
    }, status=status.HTTP_200_OK)
