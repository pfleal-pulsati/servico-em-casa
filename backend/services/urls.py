from django.urls import path
from . import views
from accounts.views import ServiceCategoryListView

app_name = 'services'

urlpatterns = [
    # Solicitações de serviço
    path('requests/', views.ServiceRequestListCreateView.as_view(), name='service_request_list_create'),
    path('requests/<int:pk>/', views.ServiceRequestDetailView.as_view(), name='service_request_detail'),
    
    # Propostas de serviço
    path('assignments/', views.ServiceAssignmentListCreateView.as_view(), name='service_assignment_list_create'),
    path('assignments/<int:pk>/', views.ServiceAssignmentDetailView.as_view(), name='service_assignment_detail'),
    path('assignments/<int:assignment_id>/accept/', views.accept_assignment, name='accept_assignment'),
    path('assignments/<int:assignment_id>/complete/', views.complete_assignment, name='complete_assignment'),
    
    # Avaliações
    path('reviews/', views.ServiceReviewListCreateView.as_view(), name='service_review_list_create'),
    path('reviews/provider/<int:provider_id>/', views.provider_reviews, name='provider_reviews'),
    path('reviews/stats/<int:provider_id>/', views.provider_review_stats, name='provider_review_stats'),
    
    # Notificações
    path('notifications/', views.NotificationListView.as_view(), name='notification_list'),
    path('notifications/<int:pk>/', views.NotificationDetailView.as_view(), name='notification_detail'),
    path('notifications/mark-read/', views.mark_notifications_read, name='mark_notifications_read'),
    
    # Estatísticas
    path('statistics/', views.service_statistics, name='service_statistics'),
    
    # Categorias (redirecionamento para manter compatibilidade)
    path('categories/', ServiceCategoryListView.as_view(), name='service_categories'),
]