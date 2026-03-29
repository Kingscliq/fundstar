#![no_std]
use soroban_sdk::{contract, contracterror, contractimpl, contracttype, Address, Env, String, Vec};

/// The data structure that holds everything about a single crowdfunding campaign.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Campaign {
    pub id: u32,
    pub name: String,
    pub description: String,
    pub goal: i128,
    pub amount_raised: i128,
    pub deadline: u64,
    pub creator: Address,
    pub is_withdrawn: bool, // Added flag to prevent double-withdrawals
}

/// Keys for storing data in the contract's storage.
#[contracttype]
pub enum DataKey {
    /// Used to store the running count of all campaigns (Value: u32)
    CampaignCount,
    /// Used to store individual campaigns by their ID (Value: Campaign)
    Campaign(u32),
}

#[contracterror]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum ContractError {
    InvalidGoal = 1,
    DeadlineMustBeFuture = 2,
    DeadlineTooFar = 3,
}

#[contract]
pub struct FundStarContract;

#[contractimpl]
impl FundStarContract {
    /// Create a new campaign.
    /// Returns the ID of the newly created campaign.
    pub fn create_campaign(
        env: Env,
        creator: Address,
        name: String,
        description: String,
        goal: i128,
        deadline: u64,
    ) -> Result<u32, ContractError> {
        // Step 1: Auth enforcement
        // Verify the caller is the creator. This ensures only authorized accounts can create campaigns.
        // The host records this authorization in the invocation context.
        creator.require_auth();

        // Step 2: Input validation (deterministic checks, no host calls needed yet)
        if goal <= 0 {
            return Err(ContractError::InvalidGoal);
        }
        if deadline <= env.ledger().timestamp() {
            return Err(ContractError::DeadlineMustBeFuture);
        }
        //    Enforce reasonable campaign duration
        if deadline > env.ledger().timestamp() + 31_536_000 {
            return Err(ContractError::DeadlineTooFar);
        }

        // Step 3: Read the current campaign counter from persistent storage.
        // This tells us what ID the new campaign will get.
        // unwrap_or(0) means: if no counter exists yet, start at 0.
        let id: u32 = env
            .storage()
            .persistent()
            .get(&DataKey::CampaignCount)
            .unwrap_or(0);

        // Step 4: Construct the new Campaign record.
        // At creation, amount_raised is 0, and is_withdrawn is false (not applicable yet).
        let campaign = Campaign {
            id,
            name,
            description,
            goal,
            amount_raised: 0,
            deadline,
            creator: creator.clone(),
            is_withdrawn: false,
        };

        // Step 5: Write campaign to persistent storage under its ID key.
        // This is the main record that can be queried later via get_campaign(id).
        env.storage()
            .persistent()
            .set(&DataKey::Campaign(id), &campaign);

        // Step 6: Increment and write the counter so next campaign gets id + 1.
        env.storage()
            .persistent()
            .set(&DataKey::CampaignCount, &(id + 1));

        // Step 7: Emit event for indexers/frontends.
        // Topics include the campaign id for easy filtering by indexers.
        env.events().publish(
            ("fundstar", "campaign_created"),
            (id, creator, goal, deadline),
        );

        // Step 8: Return the newly created campaign ID to the caller.
        Ok(id)
    }

    /// Fund a specific campaign with USDC.
    pub fn fund_campaign(env: Env, campaign_id: u32, funder: Address, amount: i128) {
        // TODO: Implement
    }

    /// Withdraw funds from a successful or ended campaign to the creator's address.
    pub fn withdraw_funds(env: Env, campaign_id: u32) {
        // TODO: Implement
    }

    /// Read-only function to fetch a campaign's data.
    /// Returns Some(campaign) if found, None otherwise.
    pub fn get_campaign(env: Env, campaign_id: u32) -> Option<Campaign> {
        // Retrieve campaign record from persistent storage by ID.
        // Returns None if campaign does not exist.
        env.storage()
            .persistent()
            .get(&DataKey::Campaign(campaign_id))
    }

    /// Read-only function to get the total number of campaigns created.
    pub fn get_campaign_count(env: Env) -> u32 {
        // Retrieve the campaign counter. This is the total number of campaigns created.
        // If no campaigns exist yet, default to 0.
        env.storage()
            .persistent()
            .get(&DataKey::CampaignCount)
            .unwrap_or(0)
    }

    /// Read-only function to fetch all campaigns in creation order.
    /// TODO - switch to Indexers for faster reads - to be implemented in version 2
    pub fn get_all_campaigns(env: Env) -> Vec<Campaign> {
        let count = Self::get_campaign_count(env.clone());
        let mut campaigns = Vec::new(&env);

        let mut id = 0;
        while id < count {
            if let Some(campaign) = env.storage().persistent().get(&DataKey::Campaign(id)) {
                campaigns.push_back(campaign);
            }
            id += 1;
        }

        campaigns
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::testutils::Address as _;

    fn setup() -> (Env, FundStarContractClient<'static>) {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register(FundStarContract, ());
        let client = FundStarContractClient::new(&env, &contract_id);
        (env, client)
    }

    #[test]
    fn test_create_campaign_success() {
        let (env, client) = setup();
        let creator = Address::generate(&env);
        let deadline = env.ledger().timestamp() + 86_400;

        let campaign_id = client.create_campaign(
            &creator,
            &String::from_str(&env, "Build a Bridge"),
            &String::from_str(&env, "We need funds for construction"),
            &1_000_000,
            &deadline,
        );

        assert_eq!(campaign_id, 0);
        assert_eq!(client.get_campaign_count(), 1);

        let campaign = client.get_campaign(&0).unwrap();
        assert_eq!(campaign.id, 0);
        assert_eq!(campaign.creator, creator);
        assert_eq!(campaign.goal, 1_000_000);
        assert_eq!(campaign.amount_raised, 0);
        assert!(!campaign.is_withdrawn);
    }

    #[test]
    fn test_create_campaign_invalid_goal_zero() {
        let (env, client) = setup();
        let creator = Address::generate(&env);

        let result = client.try_create_campaign(
            &creator,
            &String::from_str(&env, "Bad Campaign"),
            &String::from_str(&env, "No goal"),
            &0,
            &(env.ledger().timestamp() + 86_400),
        );

        assert!(matches!(result, Err(Ok(ContractError::InvalidGoal))));
    }

    #[test]
    fn test_create_campaign_invalid_goal_negative() {
        let (env, client) = setup();
        let creator = Address::generate(&env);

        let result = client.try_create_campaign(
            &creator,
            &String::from_str(&env, "Negative Campaign"),
            &String::from_str(&env, "Weird"),
            &-1_000_000,
            &(env.ledger().timestamp() + 86_400),
        );

        assert!(matches!(result, Err(Ok(ContractError::InvalidGoal))));
    }

    #[test]
    fn test_create_campaign_current_time_deadline() {
        let (env, client) = setup();
        let creator = Address::generate(&env);
        let now = env.ledger().timestamp();

        let result = client.try_create_campaign(
            &creator,
            &String::from_str(&env, "Now Campaign"),
            &String::from_str(&env, "No time"),
            &1_000_000,
            &now,
        );

        assert!(matches!(
            result,
            Err(Ok(ContractError::DeadlineMustBeFuture))
        ));
    }

    #[test]
    fn test_create_campaign_deadline_too_far() {
        let (env, client) = setup();
        let creator = Address::generate(&env);

        let result = client.try_create_campaign(
            &creator,
            &String::from_str(&env, "Far Campaign"),
            &String::from_str(&env, "Too far away"),
            &1_000_000,
            &(env.ledger().timestamp() + 31_536_001),
        );

        assert!(matches!(result, Err(Ok(ContractError::DeadlineTooFar))));
    }

    #[test]
    fn test_multiple_campaigns_sequential_ids() {
        let (env, client) = setup();
        let creator1 = Address::generate(&env);
        let creator2 = Address::generate(&env);
        let creator3 = Address::generate(&env);

        let id1 = client.create_campaign(
            &creator1,
            &String::from_str(&env, "Campaign 1"),
            &String::from_str(&env, "First"),
            &100_000,
            &(env.ledger().timestamp() + 86_400),
        );
        let id2 = client.create_campaign(
            &creator2,
            &String::from_str(&env, "Campaign 2"),
            &String::from_str(&env, "Second"),
            &200_000,
            &(env.ledger().timestamp() + 172_800),
        );
        let id3 = client.create_campaign(
            &creator3,
            &String::from_str(&env, "Campaign 3"),
            &String::from_str(&env, "Third"),
            &300_000,
            &(env.ledger().timestamp() + 259_200),
        );

        assert_eq!(id1, 0);
        assert_eq!(id2, 1);
        assert_eq!(id3, 2);
        assert_eq!(client.get_campaign_count(), 3);

        let campaign1 = client.get_campaign(&0).unwrap();
        let campaign2 = client.get_campaign(&1).unwrap();
        let campaign3 = client.get_campaign(&2).unwrap();
        assert_eq!(campaign1.creator, creator1);
        assert_eq!(campaign2.creator, creator2);
        assert_eq!(campaign3.creator, creator3);
    }

    #[test]
    fn test_campaign_initial_state() {
        let (env, client) = setup();
        let creator = Address::generate(&env);
        let deadline = env.ledger().timestamp() + 86_400;

        client.create_campaign(
            &creator,
            &String::from_str(&env, "Init Test"),
            &String::from_str(&env, "Testing initial state"),
            &500_000,
            &deadline,
        );

        let campaign = client.get_campaign(&0).unwrap();
        assert_eq!(campaign.amount_raised, 0);
        assert!(!campaign.is_withdrawn);
        assert_eq!(campaign.deadline, deadline);
    }

    #[test]
    fn test_get_nonexistent_campaign() {
        let (_env, client) = setup();
        let result = client.get_campaign(&999);
        assert!(result.is_none());
    }

    #[test]
    fn test_get_campaign_count_empty() {
        let (_env, client) = setup();
        assert_eq!(client.get_campaign_count(), 0);
    }

    #[test]
    fn test_get_all_campaigns_empty() {
        let (_env, client) = setup();
        let campaigns = client.get_all_campaigns();
        assert_eq!(campaigns.len(), 0);
    }

    #[test]
    fn test_get_all_campaigns_returns_all_in_order() {
        let (env, client) = setup();
        let creator1 = Address::generate(&env);
        let creator2 = Address::generate(&env);

        client.create_campaign(
            &creator1,
            &String::from_str(&env, "Campaign A"),
            &String::from_str(&env, "First campaign"),
            &100_000,
            &(env.ledger().timestamp() + 86_400),
        );

        client.create_campaign(
            &creator2,
            &String::from_str(&env, "Campaign B"),
            &String::from_str(&env, "Second campaign"),
            &200_000,
            &(env.ledger().timestamp() + 172_800),
        );

        let campaigns = client.get_all_campaigns();
        assert_eq!(campaigns.len(), 2);
        assert_eq!(campaigns.get(0).unwrap().id, 0);
        assert_eq!(campaigns.get(0).unwrap().creator, creator1);
        assert_eq!(campaigns.get(1).unwrap().id, 1);
        assert_eq!(campaigns.get(1).unwrap().creator, creator2);
    }

    #[test]
    fn test_campaign_boundary_max_goal() {
        let (env, client) = setup();
        let creator = Address::generate(&env);
        let max_goal = i128::MAX;

        client.create_campaign(
            &creator,
            &String::from_str(&env, "Max Goal Campaign"),
            &String::from_str(&env, "Testing boundary"),
            &max_goal,
            &(env.ledger().timestamp() + 86_400),
        );

        let campaign = client.get_campaign(&0).unwrap();
        assert_eq!(campaign.goal, max_goal);
    }

    #[test]
    fn test_campaign_boundary_min_goal() {
        let (env, client) = setup();
        let creator = Address::generate(&env);

        client.create_campaign(
            &creator,
            &String::from_str(&env, "Min Goal Campaign"),
            &String::from_str(&env, "Testing boundary"),
            &1,
            &(env.ledger().timestamp() + 1),
        );

        let campaign = client.get_campaign(&0).unwrap();
        assert_eq!(campaign.goal, 1);
    }
}
