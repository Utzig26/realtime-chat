# API - Realtime Chat

## Stack

- **Node.js** + **TypeScript**
- **Express.js** - Framework web
- **Socket.IO** - WebSockets em tempo real
- **MongoDB** + **Mongoose** - Banco de dados
- **Redis** - Cache e sessões
- **Passport.js** - Autenticação
- **Swagger** - Documentação da API
- **Docker** - Containerização

## Arquitetura

- **Clustering** com múltiplos workers
- **Sticky sessions** para Socket.IO
- **Middleware** de autenticação e tratamento de erros
- **Validação** com Zod schemas

## Como Executar

### Desenvolvimento

```bash
# Instalar dependências
npm install

# Compilar TypeScript
npm run build

# Executar em modo desenvolvimento
npm run dev
```

### Docker

**Desenvolvimento:**
```bash
# Subir com hot reload
docker-compose up -d

# Apenas a API
docker-compose up -d api
```
**Ferramentas de Admin:**
- API Docs (Swagger): http://localhost:3000/api-docs
- Redis Commander: http://localhost:8081 (admin/admin)
- Mongo Express: http://localhost:8082 (admin/admin)

**Produção:**
```bash
# Subir sem override
docker-compose -f docker-compose.yml up -d
```

## Variáveis de Ambiente

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://mongo:27017/chat
REDIS_URL=redis://redis:6379
SALT_ROUNDS=10
COOKIE_DOMAIN=localhost
```
