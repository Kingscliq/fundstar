#![no_std]
use soroban_sdk::{contract, contracterror, contractimpl, contracttype, Address, Env, String, Symbol};

#[contracttype]
pub enum DataKey {
    Admin,
    Name,
    Symbol,
    Balance(Address),
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum TokenError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    InvalidAmount = 3,
}

#[contract]
pub struct RewardToken;

#[contractimpl]
impl RewardToken {
    /// Initialize the token with an admin and metadata
    pub fn init(env: Env, admin: Address, name: String, symbol: Symbol) -> Result<(), TokenError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(TokenError::AlreadyInitialized);
        }
        
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Name, &name);
        env.storage().instance().set(&DataKey::Symbol, &symbol);
        
        Ok(())
    }

    /// Mint new tokens. Only the admin (FundStar contract) can call this.
    pub fn mint(env: Env, to: Address, amount: i128) -> Result<(), TokenError> {
        let admin: Address = env.storage().instance()
            .get(&DataKey::Admin)
            .ok_or(TokenError::NotInitialized)?;
            
        admin.require_auth();

        if amount <= 0 {
            return Err(TokenError::InvalidAmount);
        }

        let balance = Self::balance(env.clone(), to.clone());
        env.storage().persistent().set(&DataKey::Balance(to), &(balance + amount));
        
        Ok(())
    }

    pub fn balance(env: Env, addr: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::Balance(addr))
            .unwrap_or(0)
    }

    pub fn name(env: Env) -> Result<String, TokenError> {
        env.storage().instance().get(&DataKey::Name).ok_or(TokenError::NotInitialized)
    }

    pub fn symbol(env: Env) -> Result<Symbol, TokenError> {
        env.storage().instance().get(&DataKey::Symbol).ok_or(TokenError::NotInitialized)
    }
}
