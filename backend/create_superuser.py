#!/usr/bin/env python
import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'service_platform.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Verificar se o superusuário já existe
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser(
        username='admin',
        email='admin@example.com',
        password='admin123'
    )
    print('Superusuário criado com sucesso!')
    print('Username: admin')
    print('Email: admin@example.com')
    print('Password: admin123')
else:
    print('Superusuário já existe!')