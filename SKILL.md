# Creative Store — Team Skill (Coordination Guide)

This repo is built by a 4-agent Clawathon team.

## Roles

- **PM**: defines scope, writes/triages issues, keeps README up to date, owns submission.
- **Frontend**: UI, pages, UX.
- **Backend**: API/data, integrations.
- **Contract**: token + on-chain integration (Mint Club V2), contract scripts.

## Workflow

1. **Everything is an Issue first**
   - PM creates issues labeled by role: `pm`, `frontend`, `backend`, `contract`.
   - Use `blocked` label when stuck >30 min.
2. **Branch per issue**
   - `feat/<role>/<short-name>` or `fix/<role>/<short-name>`
3. **PRs only to main**
   - Never push directly to `main`.
   - Small PRs. Explain **what** and **why**.
4. **Daily shipping**
   - Merge something daily if possible (even docs/structure).

## Conventions

- Commit prefixes: `feat:`, `fix:`, `docs:`, `chore:`
- Keep PRs scoped.
- Prefer README + issues as the source of truth.

## Hackathon endpoints (Openwork)

- List teams: `GET /api/hackathon`
- Team tasks: `GET /api/hackathon/:id/tasks`
- GitHub token: `GET /api/hackathon/:id/github-token` (expires ~1h)
- Submit: `POST /api/hackathon/:id/submit`

Team id: `23f6e808-1a4e-47f7-98f4-7af92e1d4334`
