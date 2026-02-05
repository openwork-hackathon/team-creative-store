# Creative Store MVP (A/B/C/D)

Scope:
- A: Intent -> Brief -> Drafts -> Template-based editor
- B: Multi-size preview + auto-adapt (6 fixed specs)
- C: Validate + publish + public creative page
- D: NFT lightweight proof-of-authorship on Base (hash + metadata)

## Fixed placement specs
See `@creative-store/shared/src/placementSpecs.ts`:
- 1:1 1080x1080
- 4:5 1080x1350
- 9:16 1080x1920
- 16:9 1920x1080
- Ultrawide 2560x720
- TV 4K 3840x2160

## Key objects
- Project
- Brief
- Draft
- Creative
- CreativeVersion (component tree)
- RenderJob -> Render
- PublishRecord (slug => public page)
- NftRecord (Base)

## Jobs
BullMQ queues:
- generate_drafts { briefId }
- render_version { versionId, placementSpecId }
- mint_nft { versionId }

## Providers
- AI: Gemini (drafts + images)
- Chain: Base (ERC-721/1155 minimal)

## Env
API:
- DATABASE_URL
- PORT

Worker:
- DATABASE_URL
- REDIS_URL

## Next implementation steps
1. Seed placement specs (protect endpoint)
2. Implement enqueue for generate_drafts
3. Implement editor save -> create CreativeVersion
4. Implement render pipeline (layout engine + node canvas)
5. Add publish + public page
6. Add mint endpoint + onchain tx

## Payments / Token
- Payment medium (bonding curve token): **AICC**
  - Contract: `0x6F947b45C023Ef623b39331D0C4D21FBC51C1d45`
  - Parent / base asset: **$OPENWORK**
    - Contract: `0x299c30DD5974BF4D5bFE42C340CA40462816AB07`
- Suggested env vars are in `.env.example` (`AICC_TOKEN_ADDRESS`, `OPENWORK_TOKEN_ADDRESS`).
