# Estratégia de Branching - Git Flow

Este projeto utiliza uma estrutura de branches escalável baseada no Git Flow para organizar o desenvolvimento de forma eficiente.

## Estrutura de Branches

### 🌟 Branches Principais

- **`master`** - Branch de produção
  - Contém apenas código estável e testado
  - Cada commit representa uma versão de produção
  - Protegida contra push direto

- **`develop`** - Branch de desenvolvimento
  - Integração contínua de features
  - Base para criação de novas features
  - Código sempre funcional, mas pode não estar pronto para produção

### 🚀 Branches de Suporte

#### Feature Branches
- **Padrão**: `feature/nome-da-funcionalidade`
- **Origem**: `develop`
- **Destino**: `develop`
- **Propósito**: Desenvolvimento de novas funcionalidades

**Exemplos:**
- `feature/authentication` - Sistema de autenticação
- `feature/service-management` - Gerenciamento de serviços
- `feature/payment-integration` - Integração de pagamentos

#### Release Branches
- **Padrão**: `release/vX.Y.Z`
- **Origem**: `develop`
- **Destino**: `master` e `develop`
- **Propósito**: Preparação para release de produção

**Exemplo:**
- `release/v1.0.0` - Primeira versão de produção

#### Hotfix Branches
- **Padrão**: `hotfix/nome-do-fix`
- **Origem**: `master`
- **Destino**: `master` e `develop`
- **Propósito**: Correções urgentes em produção

## 📋 Fluxo de Trabalho

### 1. Desenvolvimento de Feature
```bash
# Criar nova feature
git checkout develop
git pull origin develop
git checkout -b feature/nova-funcionalidade

# Desenvolver e commitar
git add .
git commit -m "feat: implementa nova funcionalidade"

# Push da feature
git push origin feature/nova-funcionalidade

# Criar Pull Request para develop
```

### 2. Preparação de Release
```bash
# Criar branch de release
git checkout develop
git checkout -b release/v1.1.0

# Ajustes finais, testes, documentação
git commit -m "chore: prepare release v1.1.0"

# Merge para master
git checkout master
git merge release/v1.1.0
git tag v1.1.0

# Merge de volta para develop
git checkout develop
git merge release/v1.1.0
```

### 3. Hotfix de Produção
```bash
# Criar hotfix
git checkout master
git checkout -b hotfix/correcao-critica

# Implementar correção
git commit -m "fix: corrige bug crítico"

# Merge para master
git checkout master
git merge hotfix/correcao-critica
git tag v1.0.1

# Merge para develop
git checkout develop
git merge hotfix/correcao-critica
```

## 🎯 Convenções de Commit

- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Documentação
- `style:` - Formatação, sem mudança de lógica
- `refactor:` - Refatoração de código
- `test:` - Adição ou correção de testes
- `chore:` - Tarefas de manutenção

## 🔒 Proteções Recomendadas

### Branch `master`
- Require pull request reviews
- Require status checks to pass
- Require branches to be up to date
- Restrict pushes

### Branch `develop`
- Require pull request reviews
- Require status checks to pass

## 🚀 Benefícios desta Estrutura

✅ **Organização**: Separação clara entre desenvolvimento e produção
✅ **Escalabilidade**: Suporta múltiplas features simultâneas
✅ **Qualidade**: Code review obrigatório via Pull Requests
✅ **Rastreabilidade**: Histórico claro de features e releases
✅ **Estabilidade**: Produção sempre estável
✅ **Colaboração**: Múltiplos desenvolvedores podem trabalhar simultaneamente

---

**Nota**: Esta estrutura é ideal para projetos com múltiplos desenvolvedores e releases regulares. Para projetos menores, uma estrutura mais simples com `main` e `feature/*` pode ser suficiente.