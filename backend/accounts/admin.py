from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, ServiceCategory, ProviderProfile


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """Admin customizado para o modelo User"""
    
    list_display = ('username', 'email', 'first_name', 'last_name', 'user_type', 'city', 'is_active')
    list_filter = ('user_type', 'is_active', 'is_staff', 'city', 'state')
    search_fields = ('username', 'email', 'first_name', 'last_name', 'city')
    
    fieldsets = UserAdmin.fieldsets + (
        ('Informações Adicionais', {
            'fields': ('user_type', 'phone_number', 'profile_picture', 'city', 'state', 'address')
        }),
    )
    
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Informações Adicionais', {
            'fields': ('user_type', 'phone_number', 'city', 'state')
        }),
    )


@admin.register(ServiceCategory)
class ServiceCategoryAdmin(admin.ModelAdmin):
    """Admin para categorias de serviço"""
    
    list_display = ('name', 'icon', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'description')
    prepopulated_fields = {'icon': ('name',)}
    
    def get_queryset(self, request):
        return super().get_queryset(request).order_by('name')


@admin.register(ProviderProfile)
class ProviderProfileAdmin(admin.ModelAdmin):
    """Admin para perfis de prestadores"""
    
    list_display = ('user', 'experience_years', 'hourly_rate', 'is_available', 'rating', 'total_jobs')
    list_filter = ('is_available', 'experience_years', 'service_categories')
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'bio')
    filter_horizontal = ('service_categories',)
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('user', 'bio', 'experience_years')
        }),
        ('Serviços e Preços', {
            'fields': ('service_categories', 'hourly_rate', 'is_available')
        }),
        ('Estatísticas', {
            'fields': ('rating', 'total_jobs'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('rating', 'total_jobs')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user').prefetch_related('service_categories')
