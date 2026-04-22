#!/usr/bin/env bash
# Stops the contract from running if anyone fails
set -euo pipefail

# FundStar Level 4 Ecosystem Deployer
# This script deploys both the Reward Token and the FundStar contract,
# then performs the inter-contract "handshake" initialization.

NETWORK="${NETWORK:-testnet}"
SOURCE="${SOURCE:-fundstar}"
TARGET="wasm32v1-none"

echo ""
echo "🛰️  STARTING LEVEL 4 ECOSYSTEM DEPLOYMENT..."
echo "------------------------------------------------"

# 1. Build Phase
echo "🛠️  PHASE 1: Building contracts..."
stellar contract build
echo "✅ Build Complete."
echo ""

# 2. Deploy Reward Token
echo "🪙  PHASE 2: Deploying Reward Token (STAR)..."
REWARD_ID=$(stellar contract deploy \
    --wasm target/${TARGET}/release/reward_token.wasm \
    --source "${SOURCE}" \
    --network "${NETWORK}")
echo "✅ Reward Token Live: ${REWARD_ID}"
echo ""

# 3. Deploy FundStar Contract
echo "🚀 PHASE 3: Deploying FundStar Contract..."
FUNDSTAR_ID=$(stellar contract deploy \
    --wasm target/${TARGET}/release/fundstar_contract.wasm \
    --source "${SOURCE}" \
    --network "${NETWORK}")
echo "✅ FundStar Contract Live: ${FUNDSTAR_ID}"
echo ""

# 4. Initialize Reward Token
echo "🪙  PHASE 4: Initializing Reward Token (STAR)..."
stellar contract invoke \
    --id "${REWARD_ID}" \
    --source "${SOURCE}" \
    --network "${NETWORK}" \
    -- init \
    --admin "${FUNDSTAR_ID}" \
    --name "Star Rewards" \
    --symbol "STAR"
echo "✅ Reward Token Metadata & Admin set."
echo ""

# 5. The Handshake (Initialize FundStar)
echo "🤝 PHASE 5: Linking FundStar to Reward Token..."
stellar contract invoke \
    --id "${FUNDSTAR_ID}" \
    --source "${SOURCE}" \
    --network "${NETWORK}" \
    -- init \
    --reward_token "${REWARD_ID}"
echo "✅ Inter-Contract Handshake Complete."
echo ""

echo "------------------------------------------------"
echo "🌟 ECOSYSTEM LIVE!"
echo "Main Contract: ${FUNDSTAR_ID}"
echo "Reward Token:  ${REWARD_ID}"
echo "------------------------------------------------"
echo "Next step: Update your .env file with these IDs!"
echo ""
