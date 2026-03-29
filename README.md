# FundStar (Soroban Crowdfunding Contract)

FundStar is a Soroban smart contract for creating and reading crowdfunding campaigns.

This repository includes helper scripts so users can run the project without manually typing long CLI commands.

## Prerequisites

1. Rust + Cargo installed
2. Stellar CLI installed (`stellar --version`)
3. Wasm target installed:

```bash
rustup target add wasm32v1-none
```

4. A Stellar testnet identity (example name: `fundstar`)

```bash
stellar keys generate fundstar
stellar keys fund fundstar --network testnet
```

## Project Scripts

### `scripts/contract.sh`

Used for test/build/deploy.

```bash
./scripts/contract.sh test
./scripts/contract.sh build
./scripts/contract.sh deploy
./scripts/contract.sh all
```

Defaults used by this script:

1. `NETWORK=testnet`
2. `SOURCE_ACCOUNT=fundstar`
3. `ALIAS=fundstar_contract`

Override them per command if needed:

```bash
NETWORK=testnet SOURCE_ACCOUNT=fundstar ALIAS=fundstar_contract ./scripts/contract.sh all
```

### `scripts/invoke.sh`

Used to invoke contract functions.

It expects:

1. `CONTRACT_ID` (required)
2. `NETWORK` (optional, default `testnet`)
3. `SOURCE_ACCOUNT` (optional, default `fundstar`)

The script auto-loads `.env` if present.

## Quick Start (Recommended)

1. Copy environment template:

```bash
cp .env.example .env
```

2. Open `.env` and set your deployed contract id:

```bash
CONTRACT_ID=CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NETWORK=testnet
SOURCE_ACCOUNT=fundstar
```

3. Run full contract flow:

```bash
./scripts/contract.sh all
```

4. Invoke contract methods:

```bash
./scripts/invoke.sh get_campaign_count
./scripts/invoke.sh get_all_campaigns
./scripts/invoke.sh get_campaign --campaign_id 0
```

## Create Campaign Example

Set a future deadline (30 days from now) and create a campaign:

```bash
DEADLINE=$(( $(date +%s) + 2592000 ))

./scripts/invoke.sh create_campaign \
  --creator fundstar \
  --name "FundStar Demo Campaign" \
  --description "First campaign created via script" \
  --goal 1000000 \
  --deadline "$DEADLINE"
```

## Read Methods

Get number of campaigns:

```bash
./scripts/invoke.sh get_campaign_count
```

Get one campaign by id:

```bash
./scripts/invoke.sh get_campaign --campaign_id 0
```

Get all campaigns:

```bash
./scripts/invoke.sh get_all_campaigns
```

## Troubleshooting

### `Missing CONTRACT_ID`

1. Confirm `.env` exists in project root
2. Confirm `.env` contains a valid `CONTRACT_ID=C...`
3. Ensure no trailing characters in the id

Check quickly:

```bash
cat .env
```

### Wrong network or wrong contract id

Make sure deploy and invoke use the same network (`testnet`).

### Contract changed but behavior is old

You likely deployed an old Wasm artifact. Re-run:

```bash
./scripts/contract.sh all
```

## Security Notes

1. Commit scripts (`scripts/contract.sh`, `scripts/invoke.sh`)
2. Do not commit `.env` with secrets
3. Keep private keys and seed phrases out of repository files
