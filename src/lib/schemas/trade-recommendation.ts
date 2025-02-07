import { z } from 'zod';

export const tradeRecommendationSchema = z.object({
  recommendations: z.array(
    z.object({
      trade: z.object({
        name: z.string(),
        token_contract: z.string(),
        trade_action: z.enum(['BUY', 'SELL', 'HOLD']),
        conviction_level: z.enum(['HIGH', 'MEDIUM', 'LOW']),
        time_horizon: z.enum(['SHORT', 'MEDIUM', 'LONG']),
        allocation_percentage: z.number().min(0).max(100),
      }),
      justification: z.string(),
    })
  ),
});

export type TradeRecommendation = z.infer<typeof tradeRecommendationSchema>;
