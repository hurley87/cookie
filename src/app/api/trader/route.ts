import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { supabaseService } from '@/lib/services/supabase';
import {
  getSystemPrompt,
  generateTradePrompt,
} from '@/lib/prompts/trade-generator';
import { tradeRecommendationSchema } from '@/lib/schemas/trade-recommendation';
// import { CdpAgentkit } from '@coinbase/cdp-agentkit-core';
// import { HumanMessage } from '@langchain/core/messages';
// import { CdpToolkit } from '@coinbase/cdp-langchain';
// import { ChatOpenAI } from '@langchain/openai';
// import { createReactAgent } from '@langchain/langgraph/prebuilt';
// import { z } from 'zod';

// Environment variable schema
// const envSchema = z.object({
//   API_KEY_NAME: z.string(),
//   API_KEY_PRIVATE_KEY: z.string(),
//   WALLET_DATA: z.string(),
//   NETWORK_ID: z.string(),
//   OPENAI_API_KEY: z.string(),
// });

// Agent configuration type
// interface AgentConfig {
//   cdpWalletData: string;
//   networkId: string;
//   cdpApiKeyName: string;
//   cdpApiKeyPrivateKey: string;
//   source: string;
//   sourceVersion: string;
// }

// type Recommendation = z.infer<typeof tradeRecommendationSchema>;

/**
 * Initializes the game agent with the specified configuration
 */
// async function initializeGameAgent({
//   cdpApiKeyName,
//   cdpWalletData,
//   cdpApiKeyPrivateKey,
//   recommendation,
//   networkId,
//   apiKey,
// }: {
//   cdpApiKeyName: string;
//   cdpWalletData: string;
//   cdpApiKeyPrivateKey: string;
//   recommendation: Recommendation;
//   networkId: string;
//   apiKey: string;
// }) {
//   const llm = new ChatOpenAI({
//     model: 'gpt-4o-mini',
//     apiKey,
//   });

//   const agentConfig: AgentConfig = {
//     cdpWalletData,
//     networkId,
//     cdpApiKeyName,
//     cdpApiKeyPrivateKey,
//     source: 'agentkit-core',
//     sourceVersion: '0.0.1',
//   };

//   const agentkit = await CdpAgentkit.configureWithWallet(agentConfig);
//   const cdpToolkit = new CdpToolkit(agentkit);
//   const tools = cdpToolkit.getTools();

//   // Extract trade details from the recommendation
//   const trade = recommendation.recommendations[0].trade;

//   const tradeRules = `
//     You are a trading agent operating on the Base network. Your task is to execute the following trade:

//     Asset: ${trade.name}
//     Contract: ${trade.token_contract}
//     Action: ${trade.trade_action}
//     Allocation: ${trade.allocation_percentage}%
//     Conviction Level: ${trade.conviction_level}
//     Time Horizon: ${trade.time_horizon}

//     Trading Rules:
//     1. Execute the trade at the current market price
//     2. Allocate exactly ${trade.allocation_percentage}% of available capital
//     3. Verify all transaction parameters before execution
//     4. Report back the execution status, including:
//        - Executed price
//        - Transaction hash
//        - Allocated amount
//        - Any relevant warnings or errors

//     Do not deviate from these parameters without explicit authorization.
//   `;

//   const agent = createReactAgent({
//     llm,
//     tools,
//     stateModifier: tradeRules,
//   });

//   return {
//     agent,
//     llm,
//     config: agentConfig,
//   };
// }

export async function GET() {
  try {
    const { data: agents, error } = await supabaseService
      .from('agents')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Supabase error:', error);
      return Response.json(
        { error: 'Failed to fetch agents' },
        { status: 500 }
      );
    }

    if (!agents || agents.length === 0) {
      return Response.json({ error: 'No agents found' }, { status: 404 });
    }

    // Generate trading recommendations
    const { object: recommendations } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: tradeRecommendationSchema,
      system: getSystemPrompt(),
      prompt: generateTradePrompt(agents),
    });

    // Filter out HOLD recommendations and non-HIGH conviction trades
    const filteredRecommendations = recommendations.recommendations.filter(
      (rec) =>
        rec.trade.trade_action !== 'HOLD' &&
        rec.trade.conviction_level === 'HIGH'
    );

    // If no valid recommendations after filtering, return empty response
    if (filteredRecommendations.length === 0) {
      return Response.json({ recommendations: { recommendations: [] } });
    }

    // Recalculate allocations for BUY trades to ensure they sum to 100%
    const buyRecommendations = filteredRecommendations.filter(
      (rec) => rec.trade.trade_action === 'BUY'
    );

    if (buyRecommendations.length > 0) {
      const totalAllocation = buyRecommendations.reduce(
        (sum, rec) => sum + rec.trade.allocation_percentage,
        0
      );

      // Normalize allocations to sum to 100%
      buyRecommendations.forEach((rec) => {
        rec.trade.allocation_percentage =
          (rec.trade.allocation_percentage / totalAllocation) * 100;
      });
    }

    // Execute trades sequentially
    const results = [];
    for (const recommendation of filteredRecommendations) {
      console.log('recommendation', recommendation);
      try {
        // const env = envSchema.parse(process.env);
        // const { agent } = await initializeGameAgent({
        //   cdpApiKeyName: env.API_KEY_NAME,
        //   cdpWalletData: env.WALLET_DATA,
        //   cdpApiKeyPrivateKey: env.API_KEY_PRIVATE_KEY,
        //   recommendation: { recommendations: [recommendation] },
        //   networkId: env.NETWORK_ID,
        //   apiKey: env.OPENAI_API_KEY,
        // });
        // const stream = await agent.stream({
        //   messages: [new HumanMessage('Execute the trade')],
        // });
        // let agentResponse = '';
        // for await (const chunk of stream) {
        //   if ('agent' in chunk) {
        //     agentResponse = chunk.agent.messages[0].content;
        //   } else if ('tools' in chunk) {
        //     console.log(chunk.tools.messages[0].content);
        //   }
        // }
        // console.log('agentResponse', agentResponse);
        // results.push({
        //   recommendation,
        //   result: agentResponse,
        //   status: 'success',
        // });
      } catch (error) {
        console.error(
          `Trade execution failed for ${recommendation.trade.name}:`,
          error
        );
        results.push({
          recommendation,
          result: null,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        // Continue with next trade even if current one fails
        continue;
      }
    }

    console.log('results', results);

    return Response.json({
      recommendations: filteredRecommendations,
      execution_results: results,
    });
  } catch (error) {
    console.error('API error:', error);
    return Response.json(
      { error: 'Failed to perform analysis' },
      { status: 500 }
    );
  }
}
