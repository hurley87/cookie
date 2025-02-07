import { z } from 'zod';
import { CdpAgentkit } from '@coinbase/cdp-agentkit-core';
import { HumanMessage } from '@langchain/core/messages';
import { CdpToolkit } from '@coinbase/cdp-langchain';
import { ChatOpenAI } from '@langchain/openai';
import { createReactAgent } from '@langchain/langgraph/prebuilt';

// Environment variable schema
const envSchema = z.object({
  API_KEY_NAME: z.string(),
  API_KEY_PRIVATE_KEY: z.string(),
  WALLET_DATA: z.string(),
  NETWORK_ID: z.string(),
  OPENAI_API_KEY: z.string(),
});

// Agent configuration type
interface AgentConfig {
  cdpWalletData: string;
  networkId: string;
  cdpApiKeyName: string;
  cdpApiKeyPrivateKey: string;
  source: string;
  sourceVersion: string;
}

type Trade = {
  name: string;
  token_contract: string;
  trade_action: string;
  allocation_percentage: number;
  conviction_level: string;
  time_horizon: string;
};

type Recommendation = {
  trade: Trade;
  justification: string;
};

/**
 * Initializes the game agent with the specified configuration
 */
async function initializeGameAgent({
  cdpApiKeyName,
  cdpWalletData,
  cdpApiKeyPrivateKey,
  recommendation,
  networkId,
  apiKey,
}: {
  cdpApiKeyName: string;
  cdpWalletData: string;
  cdpApiKeyPrivateKey: string;
  recommendation: Recommendation;
  networkId: string;
  apiKey: string;
}) {
  const llm = new ChatOpenAI({
    model: 'gpt-4o-mini',
    apiKey,
  });

  const agentConfig: AgentConfig = {
    cdpWalletData,
    networkId,
    cdpApiKeyName,
    cdpApiKeyPrivateKey,
    source: 'agentkit-core',
    sourceVersion: '0.0.1',
  };

  const agentkit = await CdpAgentkit.configureWithWallet(agentConfig);
  const cdpToolkit = new CdpToolkit(agentkit);
  const tools = cdpToolkit.getTools();

  // Extract trade details from the recommendation
  const trade = recommendation.trade;

  const tradeRules = `
    You are a trading agent operating on the Base network. Your task is to execute the following trade:

    Asset: ${trade.name}
    Contract: ${trade.token_contract}
    Action: ${trade.trade_action}
    Allocation: ${trade.allocation_percentage}%

    Trading Rules:
    1. Execute the trade at the current market price
    2. Allocate exactly ${trade.allocation_percentage}% of available capital
    3. Verify all transaction parameters before execution
    4. Report back the execution status, including:
       - Executed price
       - Transaction hash
       - Allocated amount
       - Any relevant warnings or errors

    Do not deviate from these parameters without explicit authorization.
  `;

  const agent = createReactAgent({
    llm,
    tools,
    stateModifier: tradeRules,
  });

  return {
    agent,
    llm,
    config: agentConfig,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { recommendation } = body;

    if (!recommendation) {
      return Response.json(
        { error: 'Missing recommendation in request body' },
        { status: 400 }
      );
    }

    const env = envSchema.parse(process.env);
    const { agent } = await initializeGameAgent({
      cdpApiKeyName: env.API_KEY_NAME,
      cdpWalletData: env.WALLET_DATA,
      cdpApiKeyPrivateKey: env.API_KEY_PRIVATE_KEY,
      recommendation,
      networkId: env.NETWORK_ID,
      apiKey: env.OPENAI_API_KEY,
    });

    const stream = await agent.stream({
      messages: [new HumanMessage('Execute the trade')],
    });

    let agentResponse = '';
    for await (const chunk of stream) {
      if ('agent' in chunk) {
        agentResponse = chunk.agent.messages[0].content;
      } else if ('tools' in chunk) {
        console.log(chunk.tools.messages[0].content);
      }
    }

    return Response.json({
      status: 'success',
      recommendation,
      result: agentResponse,
    });
  } catch (error) {
    console.error('Trade execution error:', error);
    return Response.json(
      {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
