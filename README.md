# Realtime Chat

Aplicação de chat em tempo real com WebSockets, autenticação e clustering.

## Quick Start

```bash
git clone git@github.com:Utzig26/realtime-chat.git
cd realtime-chat
docker-compose up -d
```

**Acesse:** http://localhost:5000

## Stack

- **Backend**: Node.js + TypeScript + Express + Socket.IO + Cluster
- **Frontend**: Next.js + TypeScript + Tailwind CSS
- **Database**: MongoDB + Redis
- **Containerização**: Docker + Docker Compose

## Como Executar

### Desenvolvimento

```bash
# Subir todos os serviços com hot reload
docker-compose up -d

# Verificar logs
docker-compose logs -f
```

### Produção (para testar recomendo usar o de produção)

```bash
# Subir sem override (modo produção)
docker-compose -f docker-compose.yml up -d
```

## Acesso

- **Frontend**: http://localhost:5000
- **API**: http://localhost:3000
- **API Docs**: http://localhost:3000/api-docs
- **Redis Commander**: http://localhost:8081 (admin/admin)
- **Mongo Express**: http://localhost:8082 (admin/admin)

## API/FRONT
- [Backend API](./api/README.md)
- [Frontend](./front-end/README.md) 

## Variáveis de Ambiente

### Desenvolvimento

```bash
# Configurar API
cp api/.example.env api/.env

# Configurar Frontend  
cp front-end/.example.env front-end/.env
```

### Produção

**API (.env):**
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://mongo:27017/chat
REDIS_URL=redis://redis:6379
SALT_ROUNDS=12
COOKIE_DOMAIN=localhost
```

**Frontend (.env):**
```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000
NEXT_PUBLIC_APP_NAME=Realtime Chat
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ENABLE_DEBUG=false
```

## Estrutura

```
├── api/              # Backend (Node.js + Express + Socket.IO)
├── front-end/        # Frontend (Next.js)
├── docker-compose.yml
└── docker-compose.override.yml
```

## Comandos Úteis

```bash
# Parar todos os serviços
docker-compose down

# Rebuild e subir
docker-compose up -d --build

# Logs específicos
docker-compose logs -f api
docker-compose logs -f frontend
```
