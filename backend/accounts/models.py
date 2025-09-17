from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator


class User(AbstractUser):
    """Modelo de usuário customizado"""
    
    USER_TYPE_CHOICES = [
        ('client', 'Cliente'),
        ('provider', 'Prestador de Serviço'),
    ]
    
    user_type = models.CharField(
        max_length=10,
        choices=USER_TYPE_CHOICES,
        verbose_name='Tipo de Usuário'
    )
    
    phone_regex = RegexValidator(
        regex=r'^(\+?\d{1,3}[\s\-]?)?\(?\d{2,3}\)?[\s\-]?\d{4,5}[\s\-]?\d{4}$',
        message="Formato de telefone inválido. Use formatos como: (11) 99999-9999, +55 11 99999-9999, etc."
    )
    phone_number = models.CharField(
        validators=[phone_regex],
        max_length=17,
        blank=True,
        verbose_name='Telefone'
    )
    
    profile_picture = models.ImageField(
        upload_to='profile_pictures/',
        blank=True,
        null=True,
        verbose_name='Foto de Perfil'
    )
    
    city = models.CharField(
        max_length=100,
        verbose_name='Cidade'
    )
    
    state = models.CharField(
        max_length=2,
        verbose_name='Estado'
    )
    
    address = models.TextField(
        blank=True,
        verbose_name='Endereço Completo'
    )
    
    password_is_temporary = models.BooleanField(
        default=False,
        verbose_name='Senha Temporária',
        help_text='Indica se a senha atual é temporária e deve ser alterada no próximo login'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Usuário'
        verbose_name_plural = 'Usuários'
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.get_user_type_display()})"


class ServiceCategory(models.Model):
    """Categorias de serviços disponíveis"""
    
    name = models.CharField(
        max_length=100,
        unique=True,
        verbose_name='Nome da Categoria'
    )
    
    description = models.TextField(
        blank=True,
        verbose_name='Descrição'
    )
    
    icon = models.CharField(
        max_length=50,
        blank=True,
        help_text='Nome do ícone (ex: wrench, paint-brush, etc.)',
        verbose_name='Ícone'
    )
    
    is_active = models.BooleanField(
        default=True,
        verbose_name='Ativo'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Categoria de Serviço'
        verbose_name_plural = 'Categorias de Serviços'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class ProviderProfile(models.Model):
    """Perfil específico para prestadores de serviço"""
    
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='provider_profile',
        verbose_name='Usuário'
    )
    
    service_categories = models.ManyToManyField(
        ServiceCategory,
        verbose_name='Categorias de Serviço',
        help_text='Selecione as categorias de serviço que você atende'
    )
    
    bio = models.TextField(
        blank=True,
        verbose_name='Biografia/Descrição',
        help_text='Descreva sua experiência e especialidades'
    )
    
    experience_years = models.PositiveIntegerField(
        default=0,
        verbose_name='Anos de Experiência'
    )
    
    hourly_rate = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name='Valor por Hora (R$)',
        help_text='Valor aproximado por hora de trabalho'
    )
    
    is_available = models.BooleanField(
        default=True,
        verbose_name='Disponível para Novos Trabalhos'
    )
    
    rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0.00,
        verbose_name='Avaliação Média'
    )
    
    total_jobs = models.PositiveIntegerField(
        default=0,
        verbose_name='Total de Trabalhos Realizados'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Perfil do Prestador'
        verbose_name_plural = 'Perfis dos Prestadores'
    
    def __str__(self):
        return f"Prestador: {self.user.get_full_name()}"
