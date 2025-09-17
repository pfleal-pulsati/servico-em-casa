#!/bin/bash

# Script de inicialização para Railway
echo "🚀 Iniciando deploy no Railway..."

# Executar migrações
echo "📦 Executando migrações do banco de dados..."
python manage.py migrate --noinput

# Coletar arquivos estáticos
echo "📁 Coletando arquivos estáticos..."
python manage.py collectstatic --noinput

# Criar superusuário se não existir
echo "👤 Verificando superusuário..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(is_superuser=True).exists():
    User.objects.create_superuser('admin', 'admin@servicoemcasa.com', 'admin123')
    print('Superusuário criado: admin/admin123')
else:
    print('Superusuário já existe')
"

# Executar script de população de dados se necessário
if [ "$POPULATE_DATA" = "true" ]; then
    echo "🌱 Populando dados iniciais..."
    python populate_data.py
fi

echo "✅ Setup concluído! Iniciando servidor..."

# Iniciar o servidor
exec gunicorn service_platform.wsgi:application --bind 0.0.0.0:$PORT --workers 3 --timeout 120