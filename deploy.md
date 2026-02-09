# Deployment Guide

This guide covers local development setup and production deployment for Creative Store.

## Prerequisites

- [Bun](https://bun.sh/) (v1.0+)
- [Docker](https://www.docker.com/) & Docker Compose
- Node.js 18+ (for some tooling)

## Local Development Setup

### 1. Start Database Services

```bash
docker compose up -d
```

This starts:
- PostgreSQL on port 5432
- Redis on port 6379

### 2. Configure Environment

```bash
cp .env.example .env
```

Generate a secure auth secret:

```bash
BETTER_AUTH_SECRET="$(openssl rand -base64 32)"
```

Add to your `.env` file.

### 3. Google OAuth (Optional)

To enable Google Sign-In:

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID (Web application)
3. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Add credentials to `.env`:

```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

### 4. Install Dependencies

```bash
bun install
```

### 5. Run Database Migrations

```bash
bun run prisma:migrate
```

### 6. Start Development Servers

**API Server:**
```bash
bun run dev:api
```
Runs on http://localhost:3000

**Web Frontend:**
```bash
bun run dev:web
```
Runs on http://localhost:5173

### 7. AI Creative Generator (Optional)

To enable Gemini-powered creative generation:

```bash
GOOGLE_GENERATIVE_AI_API_KEY="your_key_here"
```

---

## Production Deployment

### Quick Start

1. Copy and configure production environment:

```bash
cp .env.prod.example .env.prod
# Edit .env.prod with your production values
```

2. Build and start all services:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

3. Run database migrations:

```bash
docker compose -f docker-compose.prod.yml exec api bun run --cwd packages/db prisma migrate deploy
```

### Services Overview

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

### Docker Commands

**View logs:**
```bash
docker compose -f docker-compose.prod.yml logs -f
```

**View specific service logs:**
```bash
docker compose -f docker-compose.prod.yml logs -f api
```

**Stop all services:**
```bash
docker compose -f docker-compose.prod.yml down
```

**Stop and remove volumes (WARNING: deletes data):**
```bash
docker compose -f docker-compose.prod.yml down -v
```

**Restart a specific service:**
```bash
docker compose -f docker-compose.prod.yml restart api
```

**Scale workers:**
```bash
docker compose -f docker-compose.prod.yml up -d --scale worker=3
```

### Health Checks

- **Web**: `http://localhost/health`
- **API**: `http://localhost:3000/api/health`

---

## Production Considerations

### SSL/TLS

Use a reverse proxy for HTTPS:
- [Traefik](https://traefik.io/)
- [Caddy](https://caddyserver.com/)
- Cloud load balancer (AWS ALB, GCP Load Balancer)

### Secrets Management

For production, use:
- Docker secrets
- AWS Secrets Manager
- HashiCorp Vault
- Environment-specific `.env` files (not committed)

### Database Backups

Set up automated PostgreSQL backups:

```bash
# Manual backup
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres creative_store > backup.sql

# Restore
docker compose -f docker-compose.prod.yml exec -T postgres psql -U postgres creative_store < backup.sql
```

Consider automated solutions:
- pg_dump cron jobs
- AWS RDS automated backups
- Managed database services

### Monitoring

Recommended monitoring stack:
- **Metrics**: Prometheus + Grafana
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana) or Loki
- **APM**: Sentry, Datadog, or New Relic

### Scaling

**Horizontal scaling:**
```bash
# Scale API servers
docker compose -f docker-compose.prod.yml up -d --scale api=3

# Scale workers
docker compose -f docker-compose.prod.yml up -d --scale worker=5
```

**Database scaling:**
- Read replicas for PostgreSQL
- Redis Cluster for high availability

---

## Environment Variables Reference

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection | `postgresql://user:pass@host:5432/db` |
| `REDIS_URL` | Redis connection | `redis://localhost:6379` |
| `BETTER_AUTH_SECRET` | Auth session secret | `openssl rand -base64 32` |

### Optional - Authentication

| Variable | Description |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret |

### Optional - AI

| Variable | Description |
|----------|-------------|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Gemini API key for creative generation |

### Optional - Blockchain

| Variable | Description |
|----------|-------------|
| `AICC_TOKEN_ADDRESS` | AICC token contract address |
| `OPENWORK_TOKEN_ADDRESS` | OpenWork token contract address |

### Optional - Storage

| Variable | Description |
|----------|-------------|
| `S3_ENDPOINT` | S3-compatible storage endpoint |
| `S3_ACCESS_KEY` | S3 access key |
| `S3_SECRET_KEY` | S3 secret key |
| `S3_BUCKET` | S3 bucket name |

---

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker compose ps

# View PostgreSQL logs
docker compose logs postgres

# Test connection
docker compose exec postgres psql -U postgres -c "SELECT 1"
```

### API Startup Issues

```bash
# Check API logs
docker compose -f docker-compose.prod.yml logs api

# Verify environment variables
docker compose -f docker-compose.prod.yml exec api env | grep DATABASE
```

### Migration Issues

```bash
# Reset database (development only)
bun run prisma:reset

# Generate Prisma client
bun run prisma:generate

# View migration status
bun run --cwd packages/db prisma migrate status
```

### Redis Connection Issues

```bash
# Check Redis status
docker compose exec redis redis-cli ping

# View Redis logs
docker compose logs redis
```

### Better Auth Issues

If Better Auth reports invalid origin:
1. Check `trustedOrigins` in auth configuration
2. Restart the API after updating origins
3. Verify `BETTER_AUTH_URL` matches your deployment URL
