#!/usr/bin/env bash
set -euo pipefail

# Load local .env values (if present) and export them to child processes.
if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

# Generic contract invoke helper.
# Usage:
#   CONTRACT_ID=<id> ./scripts/invoke.sh get_all_campaigns
#   CONTRACT_ID=<id> ./scripts/invoke.sh get_campaign --campaign_id 0
#   CONTRACT_ID=<id> ./scripts/invoke.sh create_campaign \
#     --creator fundstar --name "My Campaign" --description "Demo" --goal 1000000 --deadline 1760000000
#
# Optional args:
#   NETWORK=testnet|mainnet (default: testnet)
#   SOURCE_ACCOUNT=<identity|public key|secret> (default: fundstar)

CONTRACT_ID="${CONTRACT_ID:-}"
NETWORK="${NETWORK:-testnet}"
SOURCE_ACCOUNT="${SOURCE_ACCOUNT:-fundstar}"

if [[ -z "${CONTRACT_ID}" ]]; then
  echo "Missing CONTRACT_ID."
  echo "Example: CONTRACT_ID=C... ./scripts/invoke.sh get_all_campaigns"
  exit 1
fi

if [[ $# -lt 1 ]]; then
  echo "Missing contract function."
  echo "Example: CONTRACT_ID=C... ./scripts/invoke.sh get_campaign_count"
  exit 1
fi

stellar contract invoke \
  --id "${CONTRACT_ID}" \
  --source-account "${SOURCE_ACCOUNT}" \
  --network "${NETWORK}" \
  -- "$@"
