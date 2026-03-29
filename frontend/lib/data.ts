export type CampaignCategory = "Education" | "Art" | "Tech" | "Environment";
export type ArtType = "pills" | "circles" | "semis" | "health";

export interface Campaign {
  id: string;
  category: CampaignCategory;
  name: string;
  description: string;
  raised: number;
  goal: number;
  daysLeft: number;
  backers: number;
  artType: ArtType;
}

export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: "1",
    category: "Education",
    name: "Build a coding lab for rural schools",
    description: "Programming education for 500+ students across 3 underserved regions.",
    raised: 7200,
    goal: 10000,
    daysLeft: 8,
    backers: 18,
    artType: "pills",
  },
  {
    id: "2",
    category: "Art",
    name: "Decentralized music album funding",
    description: "Helping an independent artist record their debut album on-chain.",
    raised: 2800,
    goal: 10000,
    daysLeft: 21,
    backers: 6,
    artType: "circles",
  },
  {
    id: "3",
    category: "Tech",
    name: "Open source Stellar dev tools",
    description: "A comprehensive toolkit empowering developers to build the next generation of financial apps.",
    raised: 4750,
    goal: 5000,
    daysLeft: 12,
    backers: 11,
    artType: "semis",
  },
  {
    id: "4",
    category: "Environment",
    name: "Ocean plastic cleanup initiative",
    description: "Funding equipment for coastal cleanup crews in West Africa.",
    raised: 8200,
    goal: 20000,
    daysLeft: 2,
    backers: 12,
    artType: "health",
  },
];
