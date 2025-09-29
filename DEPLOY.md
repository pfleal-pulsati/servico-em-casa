# 🚀 Guia de Deploy na DigitalOcean

Este guia fornece instruções completas para fazer deploy do projeto "Serviço em Casa" na DigitalOcean.

## 📋 Pré-requisitos

- Conta na DigitalOcean
- Docker e Docker Compose instalados localmente (para testes)
- Domínio próprio (opcional, mas recomendado)

## 🔧 Opções de Deploy

### Opção 1: DigitalOcean App Platform (Recomendado)

#### 1. Preparação do Repositório

```bash
# Clone o repositório
git clone <seu-repositorio>
cd servico-em-casa

# Certifique-se de que todos os arquivos estão commitados
git add .
git commit -m "Preparação para deploy em produção"
git push origin main
```

#### 2. Configuração no App Platform

1. Acesse o [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Clique em "Create App"
3. Conecte seu repositório GitHub/GitLab
4. Configure os serviços:

**Backend Service:**
- Name: `backend`
- Source Directory: `/backend`
- Build Command: `pip install -r requirements.txt && python manage.py collectstatic --noinput`
- Run Command: `gunicorn --bind 0.0.0.0:8000 service_platform.wsgi:application`
- Port: `8000`

**Frontend Service:**
- Name: `frontend`
- Source Directory: `/frontend`
- Build Command: `npm ci && npm run build`
- Output Directory: `/dist`
- Type: Static Site

#### 3. Configuração do Banco de Dados

1. No App Platform, adicione um "Database"
2. Escolha PostgreSQL
3. Configure:
   - Name: `service-platform-db`
   - Version: 15
   - Size: Basic ($15/mês)

#### 4. Variáveis de Ambiente

Configure as seguintes variáveis no App Platform:

```env
# Django Settings
DEBUG=0
SECRET_KEY=<gere-uma-chave-secreta-forte>

# Database (será preenchido automaticamente pelo App Platform)
DATABASE_URL=${db.DATABASE_URL}

# Security
ALLOWED_HOSTS=<seu-app>.ondigitalocean.app,<seu-dominio>.com
CORS_ALLOWED_ORIGINS=https://<seu-app>.ondigitalocean.app,https://<seu-dominio>.com

# Redis (opcional - para Celery)
REDIS_URL=redis://localhost:6379/0
```

#### 5. Deploy

1. Clique em "Create Resources"
2. Aguarde o build e deploy (5-10 minutos)
3. Acesse sua aplicação na URL fornecida

### Opção 2: DigitalOcean Droplet com Docker

#### 1. Criar Droplet

```bash
# Crie um droplet Ubuntu 22.04 (mínimo $12/mês)
# Conecte via SSH
ssh root@<ip-do-droplet>
```

#### 2. Instalar Docker

```bash
# Atualizar sistema
apt update && apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
apt install docker-compose-plugin -y
```

#### 3. Configurar Aplicação

```bash
# Clonar repositório
git clone <seu-repositorio>
cd servico-em-casa

# Criar arquivo .env
cp .env.example .env
nano .env  # Configure as variáveis
```

#### 4. Deploy com Docker Compose

```bash
# Build e start dos serviços
docker compose -f docker-compose.prod.yml up -d --build

# Executar migrações
docker compose -f docker-compose.prod.yml exec backend python manage.py migrate

# Criar superuser
docker compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser

# Popular dados iniciais
docker compose -f docker-compose.prod.yml exec backend python populate_data.py
```

#### 5. Configurar Nginx (Proxy Reverso)

```bash
# Instalar Nginx
apt install nginx -y

# Configurar site
nano /etc/nginx/sites-available/servico-em-casa
```

Conteúdo do arquivo nginx:

```nginx
server {
    listen 80;
    server_name <seu-dominio>.com www.<seu-dominio>.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Ativar site
ln -s /etc/nginx/sites-available/servico-em-casa /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

#### 6. Configurar SSL com Certbot

```bash
# Instalar Certbot
apt install certbot python3-certbot-nginx -y

# Obter certificado SSL
certbot --nginx -d <seu-dominio>.com -d www.<seu-dominio>.com
```

## 🔒 Configurações de Segurança

### 1. Gerar SECRET_KEY Segura

```python
# Execute no Python
import secrets
print(secrets.token_urlsafe(50))
```

### 2. Configurar Firewall (Droplet)

```bash
# Configurar UFW
ufw allow ssh
ufw allow 80
ufw allow 443
ufw enable
```

### 3. Backup do Banco de Dados

```bash
# Backup automático (adicionar ao crontab)
0 2 * * * docker compose -f /path/to/docker-compose.prod.yml exec -T db pg_dump -U postgres service_platform > /backups/db_$(date +\%Y\%m\%d).sql
```

## 📊 Monitoramento

### 1. Logs da Aplicação

```bash
# Ver logs em tempo real
docker compose -f docker-compose.prod.yml logs -f

# Logs específicos do backend
docker compose -f docker-compose.prod.yml logs -f backend
```

### 2. Monitoramento de Recursos

```bash
# Status dos containers
docker compose -f docker-compose.prod.yml ps

# Uso de recursos
docker stats
```

## 🔄 Atualizações

### Deploy de Novas Versões

```bash
# Atualizar código
git pull origin main

# Rebuild e restart
docker compose -f docker-compose.prod.yml up -d --build

# Executar migrações se necessário
docker compose -f docker-compose.prod.yml exec backend python manage.py migrate
```

## 🆘 Troubleshooting

### Problemas Comuns

1. **Erro 502 Bad Gateway**
   - Verificar se o backend está rodando
   - Verificar logs: `docker compose logs backend`

2. **Erro de CORS**
   - Verificar `CORS_ALLOWED_ORIGINS` no .env
   - Incluir domínio correto

3. **Erro de Database**
   - Verificar `DATABASE_URL`
   - Verificar se PostgreSQL está rodando

4. **Arquivos estáticos não carregam**
   - Executar: `docker compose exec backend python manage.py collectstatic`

### Comandos Úteis

```bash
# Reiniciar serviços
docker compose -f docker-compose.prod.yml restart

# Parar todos os serviços
docker compose -f docker-compose.prod.yml down

# Limpar volumes (CUIDADO: apaga dados)
docker compose -f docker-compose.prod.yml down -v

# Acessar container do backend
docker compose -f docker-compose.prod.yml exec backend bash

# Backup do banco
docker compose -f docker-compose.prod.yml exec db pg_dump -U postgres service_platform > backup.sql
```

## 💰 Custos Estimados

### App Platform
- **Básico**: ~$25/mês (app + database)
- **Produção**: ~$50/mês (com recursos extras)

### Droplet
- **Básico**: ~$18/mês (droplet $12 + database $6)
- **Produção**: ~$35/mês (droplet maior + database)

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar logs da aplicação
2. Consultar documentação da DigitalOcean
3. Abrir issue no repositório do projeto

---

✅ **Projeto pronto para produção na DigitalOcean!**