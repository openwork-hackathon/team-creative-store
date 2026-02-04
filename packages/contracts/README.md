# Contracts (Foundry)

## Setup

```bash
cd packages/contracts
forge --version
forge install OpenZeppelin/openzeppelin-contracts --no-commit
```

## Environment

- `PRIVATE_KEY` – deployer key
- `RPC_URL` – Base RPC (or Base Sepolia)

## Deploy

```bash
forge script script/DeployCreativeProof.s.sol:DeployCreativeProof \
  --rpc-url "$RPC_URL" \
  --private-key "$PRIVATE_KEY" \
  --broadcast
```

## What this does

- `CreativeProofNFT` is a lightweight ERC-721 that mints a token representing a creative version.
- Each token stores:
  - `contentHash` (bytes32) — hash of the creative source tree
  - `metadataURI` (string) — e.g. IPFS URL

The backend should:
1) compute `contentHash` deterministically (same as worker)
2) upload metadata JSON to IPFS (or a simple centralized URL for MVP)
3) call `mint(to, contentHash, metadataURI)`
