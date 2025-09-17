from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, ServiceCategory, ProviderProfile
import logging

logger = logging.getLogger(__name__)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Serializer customizado para JWT com informações adicionais do usuário"""
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Adicionar informações customizadas ao token
        token['user_type'] = user.user_type
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        token['email'] = user.email
        
        return token
    
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Verificar se a senha é temporária
        if hasattr(self.user, 'password_is_temporary') and self.user.password_is_temporary:
            data['password_is_temporary'] = True
            data['message'] = 'Sua senha é temporária. Você deve alterá-la antes de continuar.'
        else:
            data['password_is_temporary'] = False
        
        # Adicionar dados do usuário na resposta
        data['user'] = UserProfileSerializer(self.user).data
        
        return data


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer para registro de novos usuários"""
    
    password = serializers.CharField(
        write_only=True,
        validators=[validate_password]
    )
    password_confirm = serializers.CharField(write_only=True)
    service_categories = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
        allow_empty=True
    )
    
    class Meta:
        model = User
        fields = (
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'user_type', 'phone_number',
            'city', 'state', 'address', 'service_categories'
        )
        extra_kwargs = {
            'password': {'write_only': True},
        }
    
    def validate(self, attrs):
        """Validar se as senhas coincidem"""
        logger.info(f"Validating user registration data: {list(attrs.keys())}")
        
        if attrs['password'] != attrs['password_confirm']:
            logger.error("Password confirmation failed")
            raise serializers.ValidationError("As senhas não coincidem.")
        
        logger.info("Password validation passed")
        return attrs
    
    def validate_email(self, value):
        """Validar se o email é único"""
        logger.info(f"Validating email: {value}")
        
        if User.objects.filter(email=value).exists():
            logger.error(f"Email already exists: {value}")
            raise serializers.ValidationError("Este email já está em uso.")
        
        logger.info("Email validation passed")
        return value
    
    def create(self, validated_data):
        """Criar novo usuário"""
        logger.info(f"Creating user with data: {list(validated_data.keys())}")
        
        try:
            validated_data.pop('password_confirm')
            password = validated_data.pop('password')
            service_categories = validated_data.pop('service_categories', [])
            
            logger.info(f"Creating user with username: {validated_data.get('username')}")
            
            user = User.objects.create_user(
                password=password,
                **validated_data
            )
            
            logger.info(f"User created successfully: {user.username}")
            
            # Se for prestador e tiver categorias, criar perfil do prestador
            if user.user_type == 'provider' and service_categories:
                logger.info(f"Creating provider profile with categories: {service_categories}")
                provider_profile = ProviderProfile.objects.create(user=user)
                categories = ServiceCategory.objects.filter(id__in=service_categories)
                provider_profile.service_categories.set(categories)
                logger.info("Provider profile created successfully")
            
            return user
            
        except Exception as e:
            logger.error(f"Error creating user: {str(e)}")
            raise serializers.ValidationError(f"Erro ao criar usuário: {str(e)}")


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer para perfil do usuário"""
    
    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'user_type', 'phone_number', 'profile_picture',
            'city', 'state', 'address', 'date_joined', 'is_active', 'is_staff'
        )
        read_only_fields = ('id', 'username', 'date_joined', 'user_type', 'is_staff')


class MasterPanelUserSerializer(serializers.ModelSerializer):
    """Serializer para painel master - inclui informações sensíveis"""
    provider_profile = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'user_type', 'phone_number', 'city', 'state', 'address',
            'date_joined', 'last_login', 'is_active', 'is_staff',
            'provider_profile'
        )
    
    def get_provider_profile(self, obj):
        """Retorna informações do perfil de prestador se existir"""
        if obj.user_type == 'provider' and hasattr(obj, 'provider_profile'):
            return {
                'bio': obj.provider_profile.bio,
                'experience_years': obj.provider_profile.experience_years,
                'hourly_rate': str(obj.provider_profile.hourly_rate) if obj.provider_profile.hourly_rate else None,
                'is_available': obj.provider_profile.is_available,
                'rating': str(obj.provider_profile.rating),
                'total_jobs': obj.provider_profile.total_jobs,
                'service_categories': [cat.name for cat in obj.provider_profile.service_categories.all()]
            }
        return None


class ServiceCategorySerializer(serializers.ModelSerializer):
    """Serializer para categorias de serviço"""
    
    class Meta:
        model = ServiceCategory
        fields = ('id', 'name', 'description', 'icon', 'is_active')


class ProviderProfileSerializer(serializers.ModelSerializer):
    """Serializer para perfil de prestador de serviço"""
    
    user = UserProfileSerializer(read_only=True)
    categories = ServiceCategorySerializer(many=True, read_only=True)
    category_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = ProviderProfile
        fields = (
            'id', 'user', 'bio', 'experience_years', 'hourly_rate',
            'is_available', 'rating', 'total_jobs', 'categories',
            'category_ids', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'rating', 'total_jobs', 'created_at', 'updated_at')
    
    def update(self, instance, validated_data):
        """Atualizar perfil do prestador"""
        category_ids = validated_data.pop('category_ids', None)
        
        # Atualizar campos básicos
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Atualizar categorias se fornecidas
        if category_ids is not None:
            categories = ServiceCategory.objects.filter(
                id__in=category_ids,
                is_active=True
            )
            instance.categories.set(categories)
        
        instance.save()
        return instance


class PasswordChangeSerializer(serializers.Serializer):
    """Serializer para mudança de senha"""
    
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(
        required=True,
        validators=[validate_password]
    )
    new_password_confirm = serializers.CharField(required=True)
    
    def validate_old_password(self, value):
        """Validar senha atual"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Senha atual incorreta.")
        return value
    
    def validate(self, attrs):
        """Validar se as novas senhas coincidem"""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("As novas senhas não coincidem.")
        return attrs
    
    def save(self):
        """Salvar nova senha"""
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        # Desmarcar senha como temporária quando o usuário alterar
        user.password_is_temporary = False
        user.save()
        return user