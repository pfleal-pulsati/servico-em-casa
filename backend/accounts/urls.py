from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

app_name = 'accounts'

urlpatterns = [
    # Autenticação JWT
    path('login/', views.CustomTokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', views.logout_view, name='logout'),
    
    # Registro e perfil de usuário
    path('register/', views.UserRegistrationView.as_view(), name='register'),
    path('profile/', views.UserProfileView.as_view(), name='user_profile'),
    path('user-info/', views.user_info_view, name='user_info'),
    path('change-password/', views.PasswordChangeView.as_view(), name='change_password'),
    
    # Categorias de serviço
    path('categories/', views.ServiceCategoryListView.as_view(), name='service_categories'),
    
    # Perfil de prestador
    path('provider/profile/', views.ProviderProfileView.as_view(), name='provider_profile'),
    path('provider/create/', views.ProviderProfileCreateView.as_view(), name='provider_create'),
    path('providers/', views.ProviderListView.as_view(), name='provider_list'),
    
    # Painel Master
    path('master-panel/', views.master_panel_view, name='master_panel'),
    path('admin/change-password/', views.admin_change_user_password, name='admin_change_password'),
]