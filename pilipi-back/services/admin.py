from django.contrib import admin
from .models import ServiceRequest, ServiceAssignment, ServiceReview, Notification


@admin.register(ServiceRequest)
class ServiceRequestAdmin(admin.ModelAdmin):
    """Admin para solicitações de serviço"""
    
    list_display = ('title', 'client', 'category', 'city', 'status', 'priority', 'created_at')
    list_filter = ('status', 'priority', 'category', 'city', 'state', 'created_at')
    search_fields = ('title', 'description', 'client__username', 'client__first_name', 'client__last_name')
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('client', 'category', 'title', 'description')
        }),
        ('Localização', {
            'fields': ('address', 'city', 'state')
        }),
        ('Detalhes do Serviço', {
            'fields': ('preferred_date', 'budget_min', 'budget_max', 'priority', 'images')
        }),
        ('Status', {
            'fields': ('status',)
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('client', 'category')


@admin.register(ServiceAssignment)
class ServiceAssignmentAdmin(admin.ModelAdmin):
    """Admin para atribuições de serviço"""
    
    list_display = ('service_request', 'provider', 'status', 'proposed_price', 'created_at')
    list_filter = ('status', 'created_at', 'started_at', 'completed_at')
    search_fields = (
        'service_request__title', 
        'provider__username', 
        'provider__first_name', 
        'provider__last_name'
    )
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Atribuição', {
            'fields': ('service_request', 'provider')
        }),
        ('Proposta', {
            'fields': ('proposed_price', 'estimated_duration', 'notes')
        }),
        ('Status e Datas', {
            'fields': ('status', 'started_at', 'completed_at')
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('service_request', 'provider')


@admin.register(ServiceReview)
class ServiceReviewAdmin(admin.ModelAdmin):
    """Admin para avaliações de serviço"""
    
    list_display = ('assignment', 'reviewer', 'rating', 'would_recommend', 'created_at')
    list_filter = ('rating', 'would_recommend', 'created_at')
    search_fields = (
        'assignment__service_request__title',
        'reviewer__username',
        'reviewer__first_name',
        'reviewer__last_name',
        'comment'
    )
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Avaliação', {
            'fields': ('assignment', 'reviewer', 'rating', 'would_recommend')
        }),
        ('Comentário', {
            'fields': ('comment',)
        }),
    )
    
    readonly_fields = ('created_at',)
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'assignment__service_request', 
            'assignment__provider', 
            'reviewer'
        )


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    """Admin para notificações"""
    
    list_display = ('title', 'user', 'notification_type', 'is_read', 'created_at')
    list_filter = ('notification_type', 'is_read', 'created_at')
    search_fields = ('title', 'message', 'user__username', 'user__first_name', 'user__last_name')
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Notificação', {
            'fields': ('user', 'title', 'message', 'notification_type')
        }),
        ('Status', {
            'fields': ('is_read', 'related_service_request')
        }),
    )
    
    readonly_fields = ('created_at',)
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'related_service_request')
    
    actions = ['mark_as_read', 'mark_as_unread']
    
    def mark_as_read(self, request, queryset):
        queryset.update(is_read=True)
        self.message_user(request, f"{queryset.count()} notificações marcadas como lidas.")
    mark_as_read.short_description = "Marcar como lidas"
    
    def mark_as_unread(self, request, queryset):
        queryset.update(is_read=False)
        self.message_user(request, f"{queryset.count()} notificações marcadas como não lidas.")
    mark_as_unread.short_description = "Marcar como não lidas"
