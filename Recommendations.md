# 🚀 Production Readiness & Security Roadmap

This document outlines the "Senior-level" improvements required to transition FundStar from a functional prototype to a mainnet-ready financial ecosystem. These are structured as GitHub-ready issues.

---

## 🔒 Security & Access Control

### Issue #1: Protect Initialization from Front-Running
- **Problem**: The `init` functions are public and callable by anyone. A bot could see the contract deployment and call `init` before the deployer, seizing admin control.
- **Solution**: Implement a "Deployer Pattern" where the contract is initialized in the same transaction as deployment, or check that the caller is the contract's official creator.
- **Impact**: **Critical**. Prevents hostile takeovers of the contract.

### Issue #2: Implement an Emergency "Circuit Breaker"
- **Problem**: If an exploit is discovered in the funding or withdrawal logic, there is currently no way to stop transactions.
- **Solution**: Add a `is_paused` state variable and a `toggle_pause` function (Admin only). Ensure `fund_campaign` and `withdraw_funds` check this flag.
- **Impact**: **High**. Essential for damage control during a security incident.

---

## 🏗️ State & Lifecycle Management

### Issue #3: Automated Rent Bumping (Storage Persistence)
- **Problem**: Soroban data has an expiration. If a campaign is long-lived and nobody interacts with it, its data will be archived, breaking the contract.
- **Solution**: Integrate `env.storage().persistent().extend_ttl()` inside the `fund_campaign` function to automatically extend the campaign's life every time it is interacted with.
- **Impact**: **High**. Ensures long-term data availability.

### Issue #4: Contract Upgradeability (WASM Hash Update)
- **Problem**: The contract address is currently tied to a specific version of the code. Bug fixes require a new address, which orphans existing data.
- **Solution**: Implement the `upgrade` function pattern. Allow an authorized admin to update the WASM code hash of the contract without changing the Contract ID.
- **Impact**: **Medium**. Allows for maintenance and bug fixes post-deployment.

---

## ⚖️ Governance & Logic

### Issue #5: Decentralized Admin (Multisig)
- **Problem**: A single private key controls the entire ecosystem. If that key is lost or stolen, the project is dead.
- **Solution**: Transition the `admin` address to a Stellar **Multisig** account or a simple DAO contract.
- **Impact**: **Medium**. Removes the "Single Point of Failure."

### Issue #6: Price Oracle Integration for Rewards
- **Problem**: The 10% reward is currently fixed. If the value of STAR vs XLM fluctuates wildly, the reward might become economically unsustainable.
- **Solution**: Integrate a price oracle (e.g., Pyth or Switchboard) to calculate the `reward_amount` based on real-time market value.
- **Impact**: **Low**. Improves the economic stability of the token.

---

## 📊 Observability & Performance

### Issue #7: Detailed Event Indexing
- **Problem**: Current events are basic. It's hard for external indexers to build a full history of the project.
- **Solution**: Expand events to include `campaign_updated`, `admin_changed`, and `reward_minted` with indexed topics for easier tracking by tools like Mercury or StellarExpert.
- **Impact**: **Medium**. Improves frontend transparency and data discoverability.

### Issue #8: Off-Chain Indexing & Data Caching (Indexer Pattern)
- **Problem**: Querying the blockchain directly for large lists of campaigns is slow and gas-inefficient as the project scales. The frontend "wait time" increases with every new campaign.
- **Solution**: Implement an **Indexer** (using tools like **Mercury** or a custom Node.js service). The indexer listens for `campaign_created` and `fund_received` events and syncs them to a traditional database (e.g., PostgreSQL or Supabase). The frontend then queries this DB for lightning-fast list views.
- **Impact**: **High**. Drastically improves User Experience (UX) and reduces unnecessary load on the Stellar RPC.
