# Creative Store

## Prerequisites

- Bun
- Docker (for Postgres)

## Local setup

1) Start Postgres

```bash
docker compose up -d
```

2) Create env file

```bash
cp .env.example .env
```

Set a strong secret:

```bash
BETTER_AUTH_SECRET="$(openssl rand -base64 32)"
```

**Optional: Google SSO**

To enable Google Sign-In, create OAuth 2.0 credentials in the [Google Cloud Console](https://console.cloud.google.com/apis/credentials):

1. Create a new OAuth 2.0 Client ID (Web application)
2. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
3. Copy Client ID and Client Secret to `.env`:

```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

3) Install dependencies

```bash
bun install
```

4) Run database migrations

```bash
bun run prisma:migrate -- --name add_auth_models
```

## Run API

```bash
bun run dev:api
```

API runs on http://localhost:3000

## Run Web

```bash
bun run dev:web
```

Web runs on http://localhost:5173

## AI Creative Generator

Set the following env var to enable Gemini-powered parsing/generation:

```bash
GOOGLE_GENERATIVE_AI_API_KEY="your_key_here"
```

## Troubleshooting

- If the API complains about `DATABASE_URL`, confirm it is set in `.env`.
- If Better Auth reports invalid origin, restart the API after updating `trustedOrigins`.

## Docker Production Deployment

### Quick Start

1) Copy and configure production environment:

```bash
cp .env.prod.example .env.prod
# Edit .env.prod with your production values
```

2) Build and start all services:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

3) Run database migrations:

```bash
docker compose -f docker-compose.prod.yml exec api bun run --cwd packages/db prisma migrate deploy
```

### Services

| Service | Port | Description |
|---------|------|-------------|
| web | 80 | Nginx serving React frontend |
| api | 3000 | Hono API server |
| worker | - | BullMQ background worker |
| postgres | 5432 | PostgreSQL database |
| redis | 6379 | Redis for job queue |

### Build Individual Services

```bash
# Build only API
docker build --target api -t creative-store-api .

# Build only Worker
docker build --target worker -t creative-store-worker .

# Build only Web (Nginx)
docker build --target web -t creative-store-web .
```

### Useful Commands

```bash
# View logs
docker compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker compose -f docker-compose.prod.yml logs -f api

# Stop all services
docker compose -f docker-compose.prod.yml down

# Stop and remove volumes (WARNING: deletes data)
docker compose -f docker-compose.prod.yml down -v

# Restart a specific service
docker compose -f docker-compose.prod.yml restart api

# Scale workers
docker compose -f docker-compose.prod.yml up -d --scale worker=3
```

### Health Checks

- Web: `http://localhost/health`
- API: `http://localhost:3000/api/health`

### Production Considerations

1. **SSL/TLS**: Use a reverse proxy (Traefik, Caddy, or cloud load balancer) for HTTPS
2. **Secrets**: Use Docker secrets or a secrets manager for sensitive values
3. **Backups**: Set up automated PostgreSQL backups
4. **Monitoring**: Add Prometheus/Grafana or cloud monitoring
5. **Logging**: Configure centralized logging (ELK, Loki, etc.)
