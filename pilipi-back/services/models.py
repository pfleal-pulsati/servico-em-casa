from django.db import models
from django.conf import settings
from accounts.models import ServiceCategory


class ServiceRequest(models.Model):
    """Solicitação de serviço criada por um cliente"""
    
    STATUS_CHOICES = [
        ('pending', 'Pendente'),
        ('accepted', 'Aceito'),
        ('in_progress', 'Em Andamento'),
        ('completed', 'Concluído'),
        ('cancelled', 'Cancelado'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Baixa'),
        ('medium', 'Média'),
        ('high', 'Alta'),
        ('urgent', 'Urgente'),
    ]
    
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='service_requests',
        verbose_name='Cliente'
    )
    
    category = models.ForeignKey(
        ServiceCategory,
        on_delete=models.CASCADE,
        verbose_name='Categoria do Serviço'
    )
    
    title = models.CharField(
        max_length=200,
        verbose_name='Título do Serviço'
    )
    
    description = models.TextField(
        verbose_name='Descrição Detalhada',
        help_text='Descreva o problema ou serviço necessário'
    )
    
    address = models.TextField(
        verbose_name='Endereço do Serviço'
    )
    
    city = models.CharField(
        max_length=100,
        verbose_name='Cidade'
    )
    
    state = models.CharField(
        max_length=2,
        verbose_name='Estado'
    )
    
    preferred_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Data Preferencial',
        help_text='Data e hora preferencial para o serviço (opcional)'
    )
    
    budget_min = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name='Orçamento Mínimo (R$)'
    )
    
    budget_max = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name='Orçamento Máximo (R$)'
    )
    
    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_CHOICES,
        default='medium',
        verbose_name='Prioridade'
    )
    
    status = models.CharField(
        max_length=15,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name='Status'
    )
    
    images = models.JSONField(
        default=list,
        blank=True,
        verbose_name='Imagens',
        help_text='URLs das imagens relacionadas ao problema'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Solicitação de Serviço'
        verbose_name_plural = 'Solicitações de Serviços'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.client.get_full_name()}"


class ServiceAssignment(models.Model):
    """Atribuição de um serviço a um prestador"""
    
    STATUS_CHOICES = [
        ('assigned', 'Atribuído'),
        ('started', 'Iniciado'),
        ('completed', 'Concluído'),
        ('cancelled', 'Cancelado'),
    ]
    
    service_request = models.OneToOneField(
        ServiceRequest,
        on_delete=models.CASCADE,
        related_name='assignment',
        verbose_name='Solicitação de Serviço'
    )
    
    provider = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='assigned_services',
        verbose_name='Prestador de Serviço'
    )
    
    proposed_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name='Preço Proposto (R$)'
    )
    
    estimated_duration = models.DurationField(
        null=True,
        blank=True,
        verbose_name='Duração Estimada',
        help_text='Tempo estimado para conclusão do serviço'
    )
    
    status = models.CharField(
        max_length=15,
        choices=STATUS_CHOICES,
        default='assigned',
        verbose_name='Status'
    )
    
    notes = models.TextField(
        blank=True,
        verbose_name='Observações do Prestador'
    )
    
    started_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Iniciado em'
    )
    
    completed_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Concluído em'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Atribuição de Serviço'
        verbose_name_plural = 'Atribuições de Serviços'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.service_request.title} -> {self.provider.get_full_name()}"


class ServiceReview(models.Model):
    """Avaliação de um serviço concluído"""
    
    RATING_CHOICES = [
        (1, '1 - Muito Ruim'),
        (2, '2 - Ruim'),
        (3, '3 - Regular'),
        (4, '4 - Bom'),
        (5, '5 - Excelente'),
    ]
    
    assignment = models.OneToOneField(
        ServiceAssignment,
        on_delete=models.CASCADE,
        related_name='review',
        verbose_name='Atribuição de Serviço'
    )
    
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reviews_given',
        verbose_name='Avaliador'
    )
    
    rating = models.IntegerField(
        choices=RATING_CHOICES,
        verbose_name='Avaliação'
    )
    
    comment = models.TextField(
        blank=True,
        verbose_name='Comentário'
    )
    
    would_recommend = models.BooleanField(
        default=True,
        verbose_name='Recomendaria este prestador?'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Avaliação de Serviço'
        verbose_name_plural = 'Avaliações de Serviços'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Avaliação {self.rating}/5 - {self.assignment.service_request.title}"


class Notification(models.Model):
    """Sistema de notificações para usuários"""
    
    TYPE_CHOICES = [
        ('new_request', 'Nova Solicitação Disponível'),
        ('request_accepted', 'Solicitação Aceita'),
        ('service_started', 'Serviço Iniciado'),
        ('service_completed', 'Serviço Concluído'),
        ('review_received', 'Avaliação Recebida'),
        ('general', 'Geral'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
        verbose_name='Usuário'
    )
    
    title = models.CharField(
        max_length=200,
        verbose_name='Título'
    )
    
    message = models.TextField(
        verbose_name='Mensagem'
    )
    
    notification_type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        default='general',
        verbose_name='Tipo de Notificação'
    )
    
    is_read = models.BooleanField(
        default=False,
        verbose_name='Lida'
    )
    
    related_service_request = models.ForeignKey(
        ServiceRequest,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        verbose_name='Solicitação Relacionada'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Notificação'
        verbose_name_plural = 'Notificações'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.user.username}"
