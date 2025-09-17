# Deploy no GitHub Pages

Este documento descreve como fazer o deploy da aplicação "Serviço em Casa" no GitHub Pages.

## Pré-requisitos

1. Repositório no GitHub
2. Backend hospedado em um serviço como Heroku, Railway, ou similar
3. Node.js e npm instalados localmente

## Configuração do Frontend

### 1. Configuração do Vite

O arquivo `frontend/vite.config.js` já está configurado com:
- Base path para GitHub Pages (`/servico-em-casa/`)
- Configurações de build otimizadas
- Sourcemaps para debugging

### 2. Configuração da API

O arquivo `frontend/src/services/api.js` está configurado para:
- Usar localhost em desenvolvimento
- Usar variável de ambiente `VITE_API_URL` em produção
- Fallback para URL de exemplo se a variável não estiver definida

### 3. Variáveis de Ambiente

Crie um arquivo `.env` no diretório `frontend/` com:
```
VITE_API_URL=https://sua-api-backend.herokuapp.com/api
```

## Deploy Automático com GitHub Actions

### 1. Workflow Configurado

O arquivo `.github/workflows/deploy.yml` está configurado para:
- Executar em push para `main` ou `master`
- Fazer build do frontend
- Deploy automático no GitHub Pages

### 2. Configuração do Repositório

No GitHub, vá em:
1. **Settings** → **Pages**
2. **Source**: Deploy from a branch
3. **Branch**: `gh-pages` / `/ (root)`

### 3. Permissões

Certifique-se de que o repositório tem as permissões:
- **Settings** → **Actions** → **General**
- **Workflow permissions**: Read and write permissions

## Deploy Manual

### 1. Instalar Dependências
```bash
cd frontend
npm install
```

### 2. Build de Produção
```bash
npm run build
```

### 3. Deploy
```bash
npm run deploy
```

## Configuração do Backend

### 1. CORS

Configure o CORS no backend para aceitar requisições do GitHub Pages:
```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "https://seu-usuario.github.io",
]

CORS_ALLOW_CREDENTIALS = True
```

### 2. URLs Permitidas

Adicione o domínio do GitHub Pages:
```python
# settings.py
ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    'seu-backend.herokuapp.com',
]
```

## Verificação do Deploy

1. Acesse: `https://seu-usuario.github.io/servico-em-casa/`
2. Verifique se a aplicação carrega corretamente
3. Teste o login e funcionalidades principais
4. Verifique o console do navegador para erros

## Troubleshooting

### Problema: Página em branco
- Verifique se o `base` no `vite.config.js` está correto
- Confirme se o repositório se chama `servico-em-casa`

### Problema: Erro de CORS
- Configure o CORS no backend
- Verifique se a URL da API está correta

### Problema: 404 em rotas
- O GitHub Pages não suporta SPA routing nativamente
- As rotas funcionarão apenas se acessadas diretamente pela URL base

### Problema: API não conecta
- Verifique se `VITE_API_URL` está configurada
- Confirme se o backend está rodando e acessível
- Verifique se o HTTPS está configurado no backend

## Scripts Disponíveis

- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm run preview` - Preview do build local
- `npm run predeploy` - Build antes do deploy
- `npm run deploy` - Deploy no GitHub Pages

## Estrutura de Arquivos

```
frontend/
├── .env.example          # Exemplo de variáveis de ambiente
├── vite.config.js        # Configuração do Vite
├── package.json          # Scripts e dependências
└── src/
    └── services/
        └── api.js        # Configuração da API
```

## Monitoramento

- Verifique os logs do GitHub Actions em **Actions**
- Monitor o status do deploy em **Settings** → **Pages**
- Use as ferramentas de desenvolvedor do navegador para debug