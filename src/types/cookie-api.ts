export interface CookieApiResponse {
  _7Days: CookieInterval | null;
  _3Days: CookieInterval | null;
}

export interface CookieInterval {
  twitterUsernames: string[];
  agentName: string;
  marketCapTrend: string;
  priceTrend: string;
  volumeTrend: string;
  mindshareTrend: string;
  impressionsTrend: string;
  engagementsTrend: string;
  smartFollowsTrend: string;
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
