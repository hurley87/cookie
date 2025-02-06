const dotenv = require('dotenv');
const { base } = require('./data');

// Load environment variables
dotenv.config({ path: '.env.local' });

interface Contract {
  chain: number;
  contractAddress: string;
}

interface Tweet {
  tweetUrl: string;
  tweetAuthorProfileImageUrl: string;
  tweetAuthorDisplayName: string;
  smartEngagementPoints: number;
  impressionsCount: number;
}

interface AgentDetails {
  ok: {
    agentName: string;
    contracts: Contract[];
    twitterUsernames: string[];
    mindshare: number;
    mindshareDeltaPercent: number;
    marketCap: number;
    marketCapDeltaPercent: number;
    price: number;
    priceDeltaPercent: number;
    liquidity: number;
    volume24Hours: number;
    volume24HoursDeltaPercent: number;
    holdersCount: number;
    holdersCountDeltaPercent: number;
    averageImpressionsCount: number;
    averageImpressionsCountDeltaPercent: number;
    averageEngagementsCount: number;
    averageEngagementsCountDeltaPercent: number;
    followersCount: number;
    smartFollowersCount: number;
    topTweets: Tweet[];
  };
  success: boolean;
  error: null | string;
}

// Define the structure for the base array items
interface BaseAgent {
  contracts: Contract[];
  // Add other fields if needed
}

async function fetchAgentDetails() {
  try {
    if (!process.env.COOKIE_KEY) {
      throw new Error('COOKIE_KEY environment variable is not set');
    }

    // Get the first item from the base array
    const contractAddress = base[0] as string;

    console.log(contractAddress);

    const interval = '_3Days'; // You can change this to '_7Days' if needed

    const url = `https://api.cookie.fun/v2/agents/contractAddress/${contractAddress}?interval=${interval}`;

    const response = await fetch(url, {
      headers: {
        accept: 'application/json',
        'x-api-key': process.env.COOKIE_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data: AgentDetails = await response.json();
    console.log('Agent Details:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Failed to fetch agent details:', error);
    process.exit(1);
  }
}

// Run the fetch if this file is being executed directly
if (require.main === module) {
  fetchAgentDetails();
}

export { fetchAgentDetails };
