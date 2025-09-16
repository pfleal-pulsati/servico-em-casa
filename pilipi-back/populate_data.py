#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'service_platform.settings')
django.setup()

from accounts.models import ServiceCategory, User, ProviderProfile
from services.models import ServiceRequest, ServiceAssignment, ServiceReview, Notification
from django.contrib.auth.hashers import make_password

def create_service_categories():
    """Criar categorias de serviço iniciais"""
    categories = [
        {'name': 'Limpeza', 'description': 'Serviços de limpeza residencial e comercial'},
        {'name': 'Jardinagem', 'description': 'Cuidados com jardins e plantas'},
        {'name': 'Encanamento', 'description': 'Reparos e instalações hidráulicas'},
        {'name': 'Elétrica', 'description': 'Serviços elétricos residenciais e comerciais'},
        {'name': 'Pintura', 'description': 'Pintura de paredes, casas e apartamentos'},
        {'name': 'Marcenaria', 'description': 'Móveis sob medida e reparos em madeira'},
        {'name': 'Delivery', 'description': 'Entrega de produtos e documentos'},
        {'name': 'Cuidador', 'description': 'Cuidados com idosos e crianças'},
        {'name': 'Pet Care', 'description': 'Cuidados com animais de estimação'},
        {'name': 'Tecnologia', 'description': 'Suporte técnico e reparos em equipamentos'},
    ]
    
    for cat_data in categories:
        category, created = ServiceCategory.objects.get_or_create(
            name=cat_data['name'],
            defaults={'description': cat_data['description']}
        )
        if created:
            print(f"Categoria criada: {category.name}")
        else:
            print(f"Categoria já existe: {category.name}")

def create_sample_users():
    """Criar usuários de exemplo"""
    # Cliente de exemplo
    client, created = User.objects.get_or_create(
        email='cliente@example.com',
        defaults={
            'username': 'cliente_joao',
            'first_name': 'João',
            'last_name': 'Silva',
            'phone_number': '+5511999991111',
            'user_type': 'client',
            'city': 'São Paulo',
            'state': 'SP',
            'password': make_password('123456')
        }
    )
    if created:
        print(f"Cliente criado: {client.email}")
    
    # Prestador de exemplo
    provider, created = User.objects.get_or_create(
        email='prestador@example.com',
        defaults={
            'username': 'prestador_maria',
            'first_name': 'Maria',
            'last_name': 'Santos',
            'phone_number': '+5511999992222',
            'user_type': 'provider',
            'city': 'São Paulo',
            'state': 'SP',
            'password': make_password('123456')
        }
    )
    if created:
        print(f"Prestador criado: {provider.email}")
        
        # Criar perfil do prestador
        limpeza_category = ServiceCategory.objects.get(name='Limpeza')
        profile, created = ProviderProfile.objects.get_or_create(
            user=provider,
            defaults={
                'bio': 'Especialista em limpeza residencial com 5 anos de experiência.',
                'hourly_rate': 25.00,
                'experience_years': 5,
                'is_available': True
            }
        )
        if created:
            profile.service_categories.add(limpeza_category)
            print(f"Perfil do prestador criado para: {provider.email}")

def main():
    print("Populando banco de dados com dados iniciais...")
    
    try:
        create_service_categories()
        create_sample_users()
        print("\nDados criados com sucesso!")
        
        # Estatísticas
        print(f"\nEstatísticas:")
        print(f"- Categorias: {ServiceCategory.objects.count()}")
        print(f"- Usuários: {User.objects.count()}")
        print(f"- Prestadores: {ProviderProfile.objects.count()}")
        
    except Exception as e:
        print(f"Erro ao criar dados: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()