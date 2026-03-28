# FundStar Contract Specification

## 1. Purpose
FundStar is a Soroban crowdfunding smart contract.

Current milestone focuses on campaign creation and read-only campaign retrieval.

## 2. Scope For This Milestone
Included:
- Create campaign
- Read campaign by id
- Read total campaign count
- Validation rules for campaign creation
- Campaign created event emission
- Unit tests for create campaign flow

Not yet included:
- Funding workflow
- Withdrawal workflow
- Token transfer integration

## 3. Data Model
### 3.1 Campaign
Fields:
- id: u32
- name: String
- description: String
- goal: i128
- amount_raised: i128
- deadline: u64
- creator: Address
- is_withdrawn: bool

### 3.2 Storage Keys
DataKey variants:
- CampaignCount: stores u32 total created campaigns
- Campaign(u32): stores Campaign by id

## 4. Functional Requirements
### 4.1 Create Campaign
Function: create_campaign(env, creator, name, description, goal, deadline) -> u32

Behavior:
1. Enforce caller authorization using creator.require_auth().
2. Validate goal > 0.
3. Validate deadline > env.ledger().timestamp().
4. Validate deadline <= env.ledger().timestamp() + 31_536_000.
5. Read current id from CampaignCount, default 0 if missing.
6. Build Campaign with:
   - id = current counter value
   - amount_raised = 0
   - is_withdrawn = false
7. Persist campaign at key Campaign(id).
8. Persist CampaignCount as id + 1.
9. Emit campaign_created event.
10. Return new id.

### 4.2 Get Campaign
Function: get_campaign(env, campaign_id) -> Campaign

Behavior:
1. Read campaign from persistent storage using Campaign(campaign_id).
2. If missing, fail with campaign not found.

### 4.3 Get Campaign Count
Function: get_campaign_count(env) -> u32

Behavior:
1. Read CampaignCount from storage.
2. If missing, return 0.

## 5. Validation and Invariants
- Goal must always be strictly positive.
- Deadline must be strictly in the future at creation time.
- Deadline must not exceed one year from current ledger timestamp.
- Campaign ids are sequential and monotonic from 0.
- CampaignCount equals number of successfully created campaigns.
- Newly created campaign always has amount_raised = 0 and is_withdrawn = false.

## 6. Event Requirements
Event emitted on successful creation:
- Topic: fundstar, campaign_created
- Data: id, creator, goal, deadline

## 7. Error Conditions
Create campaign must fail when:
- goal <= 0
- deadline <= current ledger timestamp
- deadline too far in future
- creator authorization is missing or invalid

Get campaign must fail when:
- campaign id does not exist

## 8. Testing Requirements
Required tests:
- Successful create campaign persists correct state and increments counter.
- goal = 0 should fail.
- goal < 0 should fail.
- past deadline should fail.
- deadline equal to now should fail.
- deadline over max range should fail.
- multiple campaign creation should produce sequential ids.
- missing campaign should fail in get_campaign.

## 9. Non-Functional Notes
- Persistent storage is used for campaign records and counter.
- Design favors deterministic and bounded operations.
- List-all behavior is expected to be implemented off-chain by reading count then fetching ids.

## 10. Next Milestone
- Implement fund_campaign.
- Implement withdraw_funds.
- Integrate token transfer client for USDC or SAC token.
- Add funding and withdrawal events.
- Add authorization and edge-case tests for funding and withdrawal paths.
