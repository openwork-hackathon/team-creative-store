# Creative Store

> AI-Powered Creative Asset Marketplace

**Demo**: [https://team-creative-store.tonob.net](https://team-creative-store.tonob.net)

## Overview

Creative Store is a full-stack platform that combines AI-powered creative generation with a decentralized marketplace for digital assets. Creators can generate, customize, and publish creative assets, while buyers can discover and purchase unique digital content with blockchain-verified ownership.

## Features

### 🎨 AI Creative Studio
- **Intent-to-Creative Pipeline**: Transform natural language descriptions into professional creative assets
- **Brief Analysis**: AI-powered analysis of creative intent to generate structured briefs
- **Multi-Draft Generation**: Generate multiple creative variations from a single brief
- **Template-Based Editor**: Fine-tune AI-generated creatives with an intuitive editor

### 📐 Multi-Size Preview & Auto-Adapt
Support for 6 fixed placement specifications:
| Spec | Dimensions | Use Case |
|------|------------|----------|
| 1:1 | 1080×1080 | Social media posts |
| 4:5 | 1080×1350 | Instagram portrait |
| 9:16 | 1080×1920 | Stories, Reels, TikTok |
| 16:9 | 1920×1080 | YouTube, presentations |
| Ultrawide | 2560×720 | Banner ads |
| TV 4K | 3840×2160 | Digital signage |

### 🛒 Marketplace
- **Browse & Discover**: Filter by category, asset type, price range
- **Categories**: Ads, Branding, E-commerce, Gaming
- **Asset Types**: Ad Kits, Branding, Characters, UI Kits, Backgrounds, Templates, Logos, 3D Scenes
- **License Options**: Standard, Extended, Exclusive
- **Creator Profiles**: View creator portfolios and ratings

### 🔗 Blockchain Integration
- **AICC Token Payments**: Native token for marketplace transactions
  - Contract: [`0x6F947b45C023Ef623b39331D0C4D21FBC51C1d45`](https://basescan.org/token/0x6F947b45C023Ef623b39331D0C4D21FBC51C1d45)
  - Built on $OPENWORK: [`0x299c30DD5974BF4D5bFE42C340CA40462816AB07`](https://basescan.org/token/0x299c30DD5974BF4D5bFE42C340CA40462816AB07)

#### 📊 AICC Token Live Data
| Metric | Link |
|--------|------|
| Token Overview | [Basescan Token Page](https://basescan.org/token/0x6F947b45C023Ef623b39331D0C4D21FBC51C1d45) |
| Holders | [Token Holders](https://basescan.org/token/0x6F947b45C023Ef623b39331D0C4D21FBC51C1d45#balances) |
| Transfers | [Transfer History](https://basescan.org/token/0x6F947b45C023Ef623b39331D0C4D21FBC51C1d45#transfers) |
| DexScreener | [AICC/WETH Chart](https://dexscreener.com/base/0x6F947b45C023Ef623b39331D0C4D21FBC51C1d45) |

### 👛 Wallet & Orders
- **Order Management**: Track purchase history and order status
- **Transaction History**: View all marketplace transactions
- **Wallet Integration**: Connect wallet for payments and NFT minting

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, TanStack Router, TailwindCSS, shadcn/ui |
| Backend | Hono (TypeScript), Better Auth |
| Database | PostgreSQL, Prisma ORM |
| Queue | Redis, BullMQ |
| AI | Google Gemini |
| Blockchain | Base (ERC-721), Viem |
| Storage | S3-compatible |

## Project Structure

```
packages/
├── web/          # React frontend application
├── api/          # Hono API server
├── worker/       # BullMQ background job processor
├── db/           # Prisma schema and migrations
├── shared/       # Shared types and schemas
└── contracts/    # Solidity smart contracts (Foundry)
```

## Local Development

See [deploy.md](./deploy.md) for detailed setup and deployment instructions.

### Quick Start

```bash
# Start database
docker compose up -d

# Install dependencies
bun install

# Setup environment
cp .env.example .env

# Run migrations
bun run prisma:migrate

# Start development servers
bun run dev:api   # API on http://localhost:3000
bun run dev:web   # Web on http://localhost:5173
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `BETTER_AUTH_SECRET` | Auth session secret |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Gemini API key |
| `AICC_TOKEN_ADDRESS` | AICC token contract |
| `OPENWORK_TOKEN_ADDRESS` | OpenWork token contract |

## License

MIT
