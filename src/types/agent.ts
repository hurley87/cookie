import { CookieApiResponse } from './cookie-api';
import { agentAnalysisSchema } from '../lib/schemas/agent-analysis';

export type TradingPosition = 'BUY' | 'SELL' | 'HOLD';

export interface TradingRecommendation {
  position: TradingPosition;
  conviction: number;
  timeHorizon: string;
}

export interface ThreeDayMetrics {
  price: number;
  priceDeltaPercent: number;
  mindshare: number;
  mindshareDeltaPercent: number;
  marketCap: number;
  marketCapDeltaPercent: number;
}

export interface Agent {
  id: string;
  name: string;
  twitter: string;
  analysis: {
    tradingRecommendation: TradingRecommendation;
  };
  _3Days: ThreeDayMetrics;
  contract_address: string;
  updated_at: string;
}

export type AgentAnalysisRecord = {
  id?: string;
  name: string;
  twitter: string;
  created_at?: string;
  updated_at?: string;
  contract_address: string;
  _7Days: CookieApiResponse['_7Days'];
  _3Days: CookieApiResponse['_3Days'];
  tweets: {
    text: string;
    isQuote: boolean;
    isReply: boolean;
    createdAt: string;
    likesCount: number;
    quotesCount: number;
    repliesCount: number;
  };
  analysis: typeof agentAnalysisSchema._type;
};
