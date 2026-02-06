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
