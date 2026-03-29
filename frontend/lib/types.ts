export interface Campaign {
  id: number;
  name: string;
  description: string;
  goal: bigint;          // i128 on-chain
  amount_raised: bigint; // i128 on-chain
  deadline: number;      // u64 unix timestamp (seconds)
  creator: string;       // Stellar public key (Address)
  is_withdrawn: boolean;
}

export interface CreateCampaignParams {
  name: string;
  description: string;
  goal: number;
  deadline: number;
}
