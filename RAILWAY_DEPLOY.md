# 🚂 Deploy no Railway - Serviço em Casa

## 📋 Pré-requisitos

1. Conta no [Railway](https://railway.app)
2. Repositório no GitHub com o código
3. Projeto configurado (já feito! ✅)

## 🚀 Passo a Passo para Deploy

### 1. Preparar o Repositório
```bash
# Fazer commit de todas as alterações
git add .
git commit -m "Configuração para deploy no Railway"
git push origin main
```

### 2. Criar Projeto no Railway

1. Acesse [railway.app](https://railway.app)
2. Faça login com GitHub
3. Clique em "New Project"
4. Selecione "Deploy from GitHub repo"
5. Escolha o repositório `servico-em-casa`
6. Selecione a pasta `backend` como root directory

### 3. Configurar Variáveis de Ambiente

No painel do Railway, vá em **Variables** e adicione:

```env
SECRET_KEY=django-insecure-CHANGE-THIS-TO-A-SECURE-KEY
DEBUG=False
ALLOWED_HOSTS=*.railway.app
POPULATE_DATA=true
```

### 4. Adicionar Banco PostgreSQL

1. No projeto Railway, clique em "New Service"
2. Selecione "PostgreSQL"
3. O Railway automaticamente criará a variável `DATABASE_URL`

### 5. Deploy Automático

O Railway detectará automaticamente:
- ✅ `Dockerfile` para build
- ✅ `railway.json` para configuração
- ✅ `start.sh` para inicialização

## 🔧 Configurações Importantes

### Variáveis de Ambiente Obrigatórias:
- `SECRET_KEY`: Chave secreta do Django
- `DEBUG`: Sempre `False` em produção
- `ALLOWED_HOSTS`: Domínio do Railway (*.railway.app)
- `DATABASE_URL`: Criada automaticamente pelo PostgreSQL

### Variáveis Opcionais:
- `POPULATE_DATA=true`: Para popular dados iniciais
- `CORS_ALLOWED_ORIGINS`: URL do frontend quando deployado

## 📱 Após o Deploy

1. **URL da API**: `https://seu-projeto.railway.app/`
2. **Admin Django**: `https://seu-projeto.railway.app/admin/`
3. **Credenciais**: `admin` / `admin123`

## 🔍 Verificar Deploy

Teste os endpoints:
- `GET /api/services/categories/` - Listar categorias
- `GET /admin/` - Painel administrativo
- `GET /api/auth/user/` - Verificar autenticação

## 🐛 Troubleshooting

### Logs do Deploy
```bash
# Ver logs no Railway dashboard ou CLI
railway logs
```

### Problemas Comuns:
1. **Erro de ALLOWED_HOSTS**: Adicionar domínio do Railway
2. **Erro de SECRET_KEY**: Gerar nova chave secreta
3. **Erro de Database**: Verificar se PostgreSQL está conectado

## 🔄 Atualizações

Para atualizar o deploy:
```bash
git add .
git commit -m "Atualização"
git push origin main
```

O Railway fará deploy automático! 🎉

## 📞 Suporte

- [Documentação Railway](https://docs.railway.app)
- [Discord Railway](https://discord.gg/railway)