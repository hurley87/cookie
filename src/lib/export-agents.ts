import { unparse } from 'papaparse';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Types for better type safety
interface Contract {
  chain: number;
  contractAddress: string;
}

interface Agent {
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
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function exportAgentsToCsv() {
  try {
    if (!process.env.COOKIE_KEY) {
      throw new Error('COOKIE_KEY environment variable is not set');
    }

    console.log('Starting agent export...');
    const allAgents: Agent[] = [];
    let currentPage = 1;
    const pageSize = 25; // Maximum page size for efficiency

    // Fetch all pages
    while (true) {
      console.log(`Fetching page ${currentPage}...`);

      // Pause for 1 second between requests to avoid rate limiting
      await sleep(1000);

      const url = `https://api.cookie.fun/v2/agents/agentsPaged?interval=_3Days&page=${currentPage}&pageSize=${pageSize}`;

      const response = await fetch(url, {
        headers: {
          accept: 'application/json',
          'x-api-key': process.env.COOKIE_KEY,
        },
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const { ok } = await response.json();
      allAgents.push(...ok.data);

      console.log(`Fetched ${allAgents.length} agents so far...`);

      if (currentPage >= ok.totalPages) {
        break;
      }
      currentPage++;
    }

    // Prepare CSV data
    const csvData = allAgents.map((agent) => ({
      agentName: agent.agentName,
      contracts: agent.contracts
        .map((c) => `${c.chain}:${c.contractAddress}`)
        .join('|'),
      twitterUsernames: agent.twitterUsernames.join('|'),
      mindshare: agent.mindshare,
      mindshareDeltaPercent: agent.mindshareDeltaPercent,
      marketCap: agent.marketCap,
      marketCapDeltaPercent: agent.marketCapDeltaPercent,
      price: agent.price,
      priceDeltaPercent: agent.priceDeltaPercent,
      liquidity: agent.liquidity,
      volume24Hours: agent.volume24Hours,
      volume24HoursDeltaPercent: agent.volume24HoursDeltaPercent,
      holdersCount: agent.holdersCount,
      holdersCountDeltaPercent: agent.holdersCountDeltaPercent,
      averageImpressionsCount: agent.averageImpressionsCount,
      averageImpressionsCountDeltaPercent:
        agent.averageImpressionsCountDeltaPercent,
      averageEngagementsCount: agent.averageEngagementsCount,
      averageEngagementsCountDeltaPercent:
        agent.averageEngagementsCountDeltaPercent,
      followersCount: agent.followersCount,
      smartFollowersCount: agent.smartFollowersCount,
    }));

    // Convert to CSV using papaparse
    const csv = unparse(csvData, {
      header: true,
    });

    // Create exports directory if it doesn't exist
    const exportDir = path.join(process.cwd(), 'exports');
    await fs.mkdir(exportDir, { recursive: true });

    // Save CSV file with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = path.join(exportDir, `agents-${timestamp}.csv`);
    await fs.writeFile(filename, csv, 'utf-8');

    console.log(
      `Successfully exported ${allAgents.length} agents to ${filename}`
    );
  } catch (error) {
    console.error('Export failed:', error);
    process.exit(1);
  }
}

// Run the export if this file is being executed directly
if (require.main === module) {
  exportAgentsToCsv();
}
