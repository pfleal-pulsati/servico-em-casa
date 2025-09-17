# 📄 Configuração GitHub Pages - Serviço em Casa

## ✅ Status da Configuração

O projeto **"Serviço em Casa"** está **TOTALMENTE CONFIGURADO** para GitHub Pages! 🎉

### 🔧 **Configurações Implementadas:**

#### 1. **Vite Configuration** ✅
- **Base Path**: Configurado para `/servico-em-casa/` em produção
- **Build Output**: `frontend/dist/`
- **Assets Directory**: `assets/`

#### 2. **GitHub Actions Workflow** ✅
- **Arquivo**: `.github/workflows/deploy.yml`
- **Trigger**: Push/PR para `main` ou `master`
- **Build**: Node.js 18 + npm
- **Deploy**: Automático para GitHub Pages

#### 3. **Build Local** ✅
- **Comando**: `npm run build` (no diretório frontend)
- **Output**: Arquivos gerados corretamente em `dist/`
- **Paths**: Caminhos ajustados para `/servico-em-casa/`

## 🚀 **Como Ativar GitHub Pages:**

### **Passo 1: Configurar no GitHub**
1. Vá para o repositório no GitHub
2. Clique em **Settings** (Configurações)
3. Role até **Pages** no menu lateral
4. Em **Source**, selecione:
   - **Deploy from a branch** OU
   - **GitHub Actions** (recomendado)

### **Passo 2: Se escolher "GitHub Actions"**
- O workflow já está configurado
- O deploy será automático a cada push

### **Passo 3: Se escolher "Deploy from a branch"**
- **Branch**: `gh-pages` (será criada automaticamente)
- **Folder**: `/ (root)`

## 📱 **URLs de Acesso:**

Após o deploy, sua aplicação estará disponível em:
- **URL Principal**: `https://[seu-usuario].github.io/servico-em-casa/`
- **Exemplo**: `https://edenilson.github.io/servico-em-casa/`

## 🔄 **Processo de Deploy:**

1. **Commit & Push** para `main`
2. **GitHub Actions** executa automaticamente
3. **Build** do frontend com Vite
4. **Deploy** para GitHub Pages
5. **Site atualizado** em ~2-5 minutos

## 🛠️ **Comandos Úteis:**

```bash
# Build local para testar
cd frontend
npm run build

# Preview local do build
npm run preview

# Verificar arquivos gerados
ls -la dist/
```

## 🔍 **Verificações de Status:**

### **GitHub Actions**
- Vá para **Actions** no repositório
- Verifique se o workflow "Deploy to GitHub Pages" está executando

### **GitHub Pages**
- Vá para **Settings > Pages**
- Verifique se está ativo e qual a URL

### **Build Local**
- Execute `npm run build` no frontend
- Verifique se `dist/index.html` tem paths com `/servico-em-casa/`

## ⚠️ **Importante:**

1. **Nome do Repositório**: Deve ser `servico-em-casa` para os paths funcionarem
2. **Branch Principal**: `main` ou `master`
3. **Permissões**: O workflow precisa de permissões de Pages
4. **Primeiro Deploy**: Pode demorar até 10 minutos

## 🐛 **Troubleshooting:**

### **Erro 404 na página**
- Verifique se o nome do repositório está correto
- Confirme se o `base` no `vite.config.js` está correto

### **CSS/JS não carregam**
- Verifique os paths no `dist/index.html`
- Confirme se o build foi feito com `NODE_ENV=production`

### **Workflow falha**
- Verifique as permissões do repositório
- Confirme se o `package.json` tem o script `build`

## 📞 **Suporte:**

Se encontrar problemas:
1. Verifique os logs do GitHub Actions
2. Teste o build local primeiro
3. Confirme as configurações do repositório

---

**✨ Seu projeto está pronto para GitHub Pages! ✨**