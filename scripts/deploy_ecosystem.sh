#!/usr/bin/env bash
# Stops the contract from running if anyone fails
set -euo pipefail

# FundStar Level 4 Ecosystem Deployer
# This script deploys both the Reward Token and the FundStar contract,
# then performs the inter-contract "handshake" initialization.

NETWORK="${NETWORK:-testnet}"
SOURCE="${SOURCE:-fundstar}"
TARGET="wasm32v1-none"

echo "🛰️  Starting Level 4 Ecosystem Deployment..."

# 1. Build everything
echo "🛠️  Building contracts..."
stellar contract build

# 2. Deploy Reward Token
echo "🪙  Deploying Reward Token (STAR)..."
REWARD_ID=$(stellar contract deploy \
    --wasm target/${TARGET}/release/reward_token.wasm \
    --source "${SOURCE}" \
    --network "${NETWORK}")
echo "✅ Reward Token Deployed: ${REWARD_ID}"

# 3. Deploy FundStar Contract
echo "🚀 Deploying FundStar Contract..."
FUNDSTAR_ID=$(stellar contract deploy \
    --wasm target/${TARGET}/release/fundstar_contract.wasm \
    --source "${SOURCE}" \
    --network "${NETWORK}")
echo "✅ FundStar Contract Deployed: ${FUNDSTAR_ID}"

# 4. Initialize Reward Token
echo "🪙  Initializing Reward Token (STAR)..."
stellar contract invoke \
    --id "${REWARD_ID}" \
    --source "${SOURCE}" \
    --network "${NETWORK}" \
    -- init \
    --admin "${FUNDSTAR_ID}" \
    --name "Star Rewards" \
    --symbol "STAR"

# 5. The Handshake (Initialize FundStar)
echo "🤝 Linking FundStar to Reward Token..."
stellar contract invoke \
    --id "${FUNDSTAR_ID}" \
    --source "${SOURCE}" \
    --network "${NETWORK}" \
    -- init \
    --reward_token "${REWARD_ID}"

echo "------------------------------------------------"
echo "🌟 ECOSYSTEM LIVE!"
echo "Main Contract: ${FUNDSTAR_ID}"
echo "Reward Token:  ${REWARD_ID}"
echo "------------------------------------------------"
echo "Next step: Update your .env file with these IDs!"
