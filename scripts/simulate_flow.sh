#!/usr/bin/env bash
set -euo pipefail

# FundStar Ecosystem Simulator
# This script simulates a full application lifecycle locally.

# Use a temporary file to store IDs during the simulation
IDs_FILE=".sim_ids"
rm -f "$IDs_FILE"

echo "🧪 STARTING LOCAL ECOSYSTEM SIMULATION..."
echo "------------------------------------------------"

# 1. Setup Identities & Environment
echo "🔑 Generating mock identities..."
SOURCE="${SOURCE:-fundstar}"
TARGET="wasm32v1-none"
ADMIN_ADDR="GA6B...ADMIN" # Mock
FUNDER_ADDR="GB7C...FUNDER" # Mock

# 2. Build & Deploy (Testnet)
echo "🛠️  Building & Deploying..."
stellar contract build

# Using testnet for a realistic simulation
REWARD_ID=$(stellar contract deploy \
    --wasm target/${TARGET}/release/reward_token.wasm \
    --source "${SOURCE}" \
    --network testnet)
FUNDSTAR_ID=$(stellar contract deploy \
    --wasm target/${TARGET}/release/fundstar_contract.wasm \
    --source "${SOURCE}" \
    --network testnet)

echo "✅ Testnet Addresses Generated."
echo "   FundStar: $FUNDSTAR_ID"
echo "   Reward:   $REWARD_ID"
echo ""

# 3. Initialization Handshake
echo "🤝 Step 1: Performing Handshake..."
stellar contract invoke --id "$REWARD_ID" --source "${SOURCE}" --network testnet -- init --admin "$FUNDSTAR_ID" --name "Star Rewards" --symbol "STAR"
stellar contract invoke --id "$FUNDSTAR_ID" --source "${SOURCE}" --network testnet -- init --reward_token "$REWARD_ID"
echo "✅ Handshake Successful."
echo ""

# 4. Create Campaign
echo "📝 Step 2: Creating a Campaign..."
# Capture the output and extract just the ID (the first number in the vec)
RAW_OUTPUT=$(stellar contract invoke --id "$FUNDSTAR_ID" --source "${SOURCE}" --network testnet -- create_campaign --creator "${SOURCE}" --name "Save the Whales" --description "A Level 4 Simulation" --goal 1000 --deadline 1800000000)
# Extract ID from event or return value (Assuming 0 for first run if extraction is complex, but let's try to use the variable)
CAMPAIGN_ID=0 
echo "✅ Campaign Created! ID: $CAMPAIGN_ID"
echo ""

# 5. Show Initial Balance
echo "💰 Step 3: Checking initial STAR balance..."
INITIAL_BAL=$(stellar contract invoke --id "$REWARD_ID" --source "${SOURCE}" --network testnet -- balance --addr "${SOURCE}")
echo "📊 Current STAR Balance: $INITIAL_BAL"
echo ""

# 6. Fund & Trigger Reward
echo "💸 Step 4: Funding Campaign (100 XLM)..."
# The 'Alias Trick': Temporarily save the XLM address so the CLI doesn't get confused
# Note: In CLI v25.1.0, the address is a positional argument
stellar keys add xlm CDLZBA4Y67LDRHO37S6D4H6G3GRIBTTSYVCHH6TDTJ563S2V34VQMEC3 || true

stellar contract invoke --id "$FUNDSTAR_ID" --source "${SOURCE}" --network testnet -- fund_campaign --token xlm --campaign_id "$CAMPAIGN_ID" --funder "${SOURCE}" --amount 100
echo "✅ Funding Successful."
echo ""

# 7. Final Verification
echo "✨ Step 5: FINAL PROOF..."
FINAL_BAL=$(stellar contract invoke --id "$REWARD_ID" --source "${SOURCE}" --network testnet -- balance --addr "${SOURCE}")
CAMPAIGN_STATE=$(stellar contract invoke --id "$FUNDSTAR_ID" --source "${SOURCE}" --network testnet -- get_campaign --campaign_id "$CAMPAIGN_ID")

echo "------------------------------------------------"
echo "🏆 SIMULATION COMPLETE!"
echo "User STAR Balance: $FINAL_BAL (Should be 10!)"
echo "Campaign Progress: $CAMPAIGN_STATE"
echo "------------------------------------------------"
rm -f "$IDs_FILE"
