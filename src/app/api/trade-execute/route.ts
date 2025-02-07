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
/**
 * Initializes the game agent with the specified configuration
 */
async function initializeGameAgent({
  cdpApiKeyName,
  cdpWalletData,
  cdpApiKeyPrivateKey,
  networkId,
  apiKey,
}: {
  cdpApiKeyName: string;
  cdpWalletData: string;
  cdpApiKeyPrivateKey: string;
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
  //   const trade = recommendation.trade;

  const tradeRules = `
    You are a trading agent operating on the Base network. Follow these precise instructions:
    
    Execute this trade immediately and report back with the results. This is not a WOW token.
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
      networkId: env.NETWORK_ID,
      apiKey: env.OPENAI_API_KEY,
    });

    let message = 'do nothing';
    if (recommendation.trade.trade_action === 'BUY') {
      message = `trade 0.001 ETH for ${recommendation.trade.name}`;
    } else if (recommendation.trade.trade_action === 'SELL') {
      message = `trade ${recommendation.trade.name} for ETH`;
    }
    const stream = await agent.stream({
      messages: [new HumanMessage(message)],
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
