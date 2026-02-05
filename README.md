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

## Troubleshooting

- If the API complains about `DATABASE_URL`, confirm it is set in `.env`.
- If Better Auth reports invalid origin, restart the API after updating `trustedOrigins`.
