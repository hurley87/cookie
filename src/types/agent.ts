import { CookieApiResponse } from './cookie-api';
import { agentAnalysisSchema } from '../lib/schemas/agent-analysis';

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
