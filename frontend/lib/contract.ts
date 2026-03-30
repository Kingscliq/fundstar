import {
  Address,
  Contract,
  Networks,
  rpc,
  scValToNative,
  nativeToScVal,
  TransactionBuilder,
  BASE_FEE,
  Account,
} from '@stellar/stellar-sdk';
import { Campaign } from './types';

const RPC_URL =
  process.env.NEXT_PUBLIC_SOROBAN_RPC_URL ||
  'https://soroban-testnet.stellar.org';
const CONTRACT_ID = process.env.NEXT_PUBLIC_FUNDSTAR_CONTRACT_ID || '';
const NETWORK_PASSPHRASE = Networks.TESTNET;

// Actual signer account from environment for more accurate simulations
const SIGNER_ADDRESS = process.env.NEXT_PUBLIC_FUNDSTAR_SIGNER_ADDRESS || 'GBFT5JB6HAFI25ALRTDGUXVSI53XS7UISM72SS3LWHYNMSJYHAZLGVN4';
const DUMMY_ACCOUNT = new Account(SIGNER_ADDRESS, '0');

const server = new rpc.Server(RPC_URL);
const contract = new Contract(CONTRACT_ID);

/**
 * Common formatting for Campaign native values returned by Soroban.
 */
function formatCampaign(val: any): Campaign {
  return {
    id: Number(val.id),
    name: val.name.toString(),
    description: val.description.toString(),
    goal: BigInt(val.goal),
    amount_raised: BigInt(val.amount_raised),
    deadline: Number(val.deadline),
    creator: val.creator.toString(),
    is_withdrawn: val.is_withdrawn,
  };
}

/**
 * Helper to simulate a contract call for read-only operations.
 */
async function simulateCall(functionName: string, ...args: any[]) {
  const tx = new TransactionBuilder(DUMMY_ACCOUNT, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(functionName, ...args))
    .setTimeout(180)
    .build();

  const result = await server.simulateTransaction(tx);

  if (rpc.Api.isSimulationSuccess(result)) {
    return scValToNative(result.result!.retval);
  } else {
    console.error(`Simulation failed for ${functionName}:`, {
      error: (result as any).error,
      events: result.events,
      fullResult: JSON.stringify(result),
    });
  }
  return null;
}

/**
 * Fetch all campaigns from the contract.
 */
export async function getAllCampaigns(): Promise<Campaign[]> {
  try {
    const nativeValues = await simulateCall('get_all_campaigns');
    if (Array.isArray(nativeValues)) {
      return nativeValues.map(formatCampaign);
    }
    return [];
  } catch (error) {
    console.error('Error fetching all campaigns:', error);
    return [];
  }
}

/**
 * Fetch a single campaign by ID.
 */
export async function getCampaignById(id: number): Promise<Campaign | null> {
  try {
    const nativeValue = await simulateCall(
      'get_campaign',
      nativeToScVal(id, { type: 'u32' }),
    );
    if (nativeValue) {
      return formatCampaign(nativeValue);
    }
    return null;
  } catch (error) {
    console.error(`Error fetching campaign ${id}:`, error);
    return null;
  }
}

/**
 * Get total campaign count.
 */
export async function getCampaignCount(): Promise<number> {
  try {
    const nativeValue = await simulateCall('get_campaign_count');
    return nativeValue ? Number(nativeValue) : 0;
  } catch (error) {
    console.error('Error fetching campaign count:', error);
    return 0;
  }
}

/**
 * Prepares a transaction for creating a campaign.
 * The caller (component) must sign this with Freighter.
 */
export async function prepareCreateCampaignTx(
  creator: string,
  name: string,
  description: string,
  goalXlm: number,
  deadlineUnix: number,
) {
  const goalStroops = BigInt(Math.floor(goalXlm * 10_000_000));
  const deadlineBigInt = BigInt(deadlineUnix);

  const account = await server.getAccount(creator);
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        'create_campaign',
        Address.fromString(creator).toScVal(),
        nativeToScVal(name),
        nativeToScVal(description),
        nativeToScVal(goalStroops, { type: 'i128' }),
        nativeToScVal(deadlineBigInt, { type: 'u64' }),
      ),
    )
    .setTimeout(180)
    .build();

  const simulated = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationSuccess(simulated)) {
    return rpc.assembleTransaction(tx, simulated).build();
  }
  throw new Error('Simulation failed');
}

/**
 * Prepares a transaction for funding a campaign.
 * amount is in XLM (user input).
 */
export async function prepareFundCampaignTx(
  campaignId: number,
  funder: string,
  amountXlm: number,
) {
  const tokenAddress = process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ID;
  if (!tokenAddress) throw new Error("NEXT_PUBLIC_TOKEN_CONTRACT_ID is missing");

  const amountStroops = BigInt(Math.floor(amountXlm * 10_000_000));

  const account = await server.getAccount(funder);
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        'fund_campaign',
        Address.fromString(tokenAddress).toScVal(),
        nativeToScVal(campaignId, { type: 'u32' }),
        Address.fromString(funder).toScVal(),
        nativeToScVal(amountStroops, { type: 'i128' }),
      ),
    )
    .setTimeout(180)
    .build();

  const simulated = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationSuccess(simulated)) {
    return rpc.assembleTransaction(tx, simulated).build();
  }
  throw new Error('Simulation failed');
}

/**
 * Prepares a transaction for withdrawing funds from a campaign.
 */
export async function prepareWithdrawFundsTx(
  campaignId: number,
  creator: string,
) {
  const tokenAddress = process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ID;
  if (!tokenAddress) throw new Error("NEXT_PUBLIC_TOKEN_CONTRACT_ID is missing");

  const account = await server.getAccount(creator);
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        'withdraw_funds',
        Address.fromString(tokenAddress).toScVal(),
        nativeToScVal(campaignId, { type: 'u32' }),
      ),
    )
    .setTimeout(180)
    .build();

  const simulated = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationSuccess(simulated)) {
    return rpc.assembleTransaction(tx, simulated).build();
  }
  throw new Error('Simulation failed');
}

/**
 * Submits a signed transaction to the network.
 */
export async function submitTx(signedTxXdr: string) {
  const tx = TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE);
  const result = await server.sendTransaction(tx);
  if (result.status === 'ERROR') {
    console.error('RPC Submission Error:', {
      status: result.status,
      errorResultXdr: result.errorResult?.toXDR?.() || JSON.stringify(result.errorResult),
      hash: result.hash,
      diagnosticEvents: result.diagnosticEvents,
    });
  }
  return result;
}

/**
 * Polls for transaction finality.
 */
export async function pollTx(
  hash: string,
): Promise<rpc.Api.GetTransactionResponse> {
  let attempts = 0;
  while (attempts < 20) {
    const response = await server.getTransaction(hash);
    if (response.status !== rpc.Api.GetTransactionStatus.NOT_FOUND) {
      return response;
    }
    attempts++;
    await new Promise(r => setTimeout(r, 1000));
  }
  throw new Error('Transaction timeout or not found after polling.');
}

/**
 * Fetch recent 'fund_received' events for a specific campaign.
 */
export async function getCampaignEvents(campaignId: number) {
  try {
    const latestLedger = await server.getLatestLedger();
    const startLedger = Math.max(0, latestLedger.sequence - 10000); // Look back ~10k ledgers

    const response = await server.getEvents({
      startLedger,
      filters: [
        {
          type: "contract",
          contractIds: [CONTRACT_ID],
        },
      ],
      limit: 50,
    });

    return response.events
      .map((event) => {
        const topics = event.topic.map((t) => scValToNative(t));
        // We look for: ["fund_received", campaign_id, funder]
        if (topics[0] === "fund_received" && Number(topics[1]) === campaignId) {
          const amountStroops = scValToNative(event.value);
          return {
            funder: topics[2].toString(),
            amount: Number(amountStroops) / 10_000_000,
            ledger: event.ledger,
            id: event.id,
          };
        }
        return null;
      })
      .filter((e): e is NonNullable<typeof e> => e !== null)
      .reverse(); // Newest first
  } catch (error) {
    console.error("Error fetching campaign events:", error);
    return [];
  }
}
