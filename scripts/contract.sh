#!/usr/bin/env bash
set -euo pipefail

# FundStar Soroban contract helper.
# Usage:
#   ./scripts/contract.sh test
#   ./scripts/contract.sh build
#   ./scripts/contract.sh deploy
#   ./scripts/contract.sh all

CONTRACT_PKG="fundstar_contract"
TARGET="wasm32v1-none"
WASM_PATH="target/${TARGET}/release/${CONTRACT_PKG}.wasm"
NETWORK="${NETWORK:-testnet}"
SOURCE_ACCOUNT="${SOURCE_ACCOUNT:-fundstar}"
ALIAS="${ALIAS:-fundstar_contract}"

run_tests() {
  echo "==> Running tests"
  cargo test -p "${CONTRACT_PKG}"
}

build_wasm() {
  echo "==> Building Wasm (${TARGET})"
  cargo build --target "${TARGET}" --release -p "${CONTRACT_PKG}"
  echo "==> Built: ${WASM_PATH}"
}

deploy_contract() {
  if [[ ! -f "${WASM_PATH}" ]]; then
    echo "Wasm not found at ${WASM_PATH}. Build first with: ./scripts/contract.sh build"
    exit 1
  fi

  echo "==> Deploying to ${NETWORK}"
  stellar contract deploy \
    --wasm "${WASM_PATH}" \
    --source-account "${SOURCE_ACCOUNT}" \
    --network "${NETWORK}" \
    --alias "${ALIAS}"
}

case "${1:-all}" in
  test)
    run_tests
    ;;
  build)
    build_wasm
    ;;
  deploy)
    deploy_contract
    ;;
  all)
    run_tests
    build_wasm
    deploy_contract
    ;;
  *)
    echo "Unknown command: ${1:-}"
    echo "Usage: ./scripts/contract.sh [test|build|deploy|all]"
    exit 1
    ;;
esac
