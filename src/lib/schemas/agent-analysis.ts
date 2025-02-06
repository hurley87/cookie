import { z } from 'zod';

export const agentAnalysisSchema = z
  .object({
    // Executive Summary
    executiveSummary: z.string().min(1),

    // Technical Analysis
    technicalAnalysis: z.object({
      score: z.number().min(0).max(10).default(5),
      priceAction: z.string().min(1),
      volumeAnalysis: z.string().min(1),
      marketStructure: z.string().min(1),
    }),

    // Social Metrics
    socialMetrics: z.object({
      score: z.number().min(0).max(10).default(5),
      sentimentAnalysis: z.string().min(1),
      engagementQuality: z.string().min(1),
      socialMomentum: z.string().min(1),
    }),

    // Trading Recommendation
    tradingRecommendation: z.object({
      position: z.enum(['BUY', 'SELL', 'HOLD']),
      conviction: z.enum(['HIGH', 'MEDIUM', 'LOW']),
      timeHorizon: z.enum(['SHORT', 'MEDIUM', 'LONG']),
    }),

    // Supporting Rationale
    supportingRationale: z.array(z.string().min(1)).min(1).default([]),
  })
  .strict();

// Export the type for use in other files
export type AgentAnalysis = z.infer<typeof agentAnalysisSchema>;
