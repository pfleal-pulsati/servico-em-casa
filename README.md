# Serviço em Casa

Plataforma de serviços domésticos que conecta clientes e prestadores de serviços de forma simples e eficiente.

## 🏗️ Arquitetura

O projeto é composto por:

- **Backend (backend)**: API REST desenvolvida em Django com Django REST Framework
- **Frontend (frontend)**: Aplicação web desenvolvida em React com Vite e TailwindCSS

## 🚀 Tecnologias

### Backend
- Python 3.x
- Django 4.x
- Django REST Framework
- PostgreSQL
- Docker

### Frontend
- React 18
- Vite
- TailwindCSS
- React Router
- Heroicons

## 📋 Funcionalidades

### Para Clientes
- ✅ Cadastro e autenticação
- ✅ Criação de solicitações de serviços
- ✅ Busca e filtros por categoria, status e prioridade
- ✅ Gerenciamento de solicitações
- ✅ Avaliação de prestadores
- ✅ Dashboard personalizado

### Para Prestadores
- ✅ Cadastro e autenticação
- ✅ Visualização de oportunidades
- ✅ Criação de propostas
- ✅ Gerenciamento de trabalhos
- ✅ Dashboard personalizado

## 🛠️ Instalação e Execução

### Pré-requisitos
- Python 3.8+
- Node.js 16+
- PostgreSQL
- Docker (opcional)

### Backend (Django)

```bash
cd backend

# Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

# Instalar dependências
pip install -r requirements.txt

# Configurar banco de dados
python manage.py migrate

# Carregar dados iniciais
python manage.py loaddata fixtures/initial_data.json

# Executar servidor
python manage.py runserver
```

### Frontend (React)

```bash
cd frontend

# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev
```

### Docker (Alternativa)

```bash
# Executar com Docker Compose
docker-compose up -d
```

## 🌐 Endpoints da API

### Autenticação
- `POST /api/auth/login/` - Login
- `POST /api/auth/register/` - Registro
- `POST /api/auth/logout/` - Logout

### Categorias
- `GET /api/accounts/categories/` - Listar categorias

### Solicitações de Serviço
- `GET /api/services/requests/` - Listar solicitações
- `POST /api/services/requests/` - Criar solicitação
- `GET /api/services/requests/{id}/` - Detalhes da solicitação
- `PUT /api/services/requests/{id}/` - Atualizar solicitação
- `DELETE /api/services/requests/{id}/` - Deletar solicitação

### Propostas
- `GET /api/services/proposals/` - Listar propostas
- `POST /api/services/proposals/` - Criar proposta

## 📱 Páginas da Aplicação

### Públicas
- `/` - Página inicial
- `/login` - Login
- `/register` - Cadastro

### Cliente
- `/dashboard` - Dashboard do cliente
- `/requests` - Minhas solicitações
- `/requests/new` - Nova solicitação
- `/requests/{id}` - Detalhes da solicitação
- `/requests/{id}/edit` - Editar solicitação

### Prestador
- `/provider/dashboard` - Dashboard do prestador
- `/provider/opportunities` - Oportunidades
- `/provider/proposals` - Minhas propostas
- `/provider/jobs` - Meus trabalhos

## 🎨 Design System

O projeto utiliza TailwindCSS com DaisyUI para componentes pré-estilizados, garantindo:
- Design responsivo
- Tema consistente
- Componentes reutilizáveis
- Acessibilidade

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` no backend com:

```env
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:password@localhost:5432/servico_em_casa
ALLOWED_HOSTS=localhost,127.0.0.1
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Autores

- **pfleal** - *Desenvolvimento inicial* - [pfleal](https://github.com/pfleal)

## 📞 Contato

- Email: contato@servicoemcasa.com
- Telefone: (11) 9999-9999

---

⭐ Se este projeto te ajudou, considere dar uma estrela no repositório!