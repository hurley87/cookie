const COOKIE_API_BASE_URL = 'https://api.cookie.fun';

export class CookieApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public interval?: string
  ) {
    super(message);
    this.name = 'CookieApiError';
  }
}

export const cookieApi = {
  async fetchAgentData(contractAddress: string, interval: '_7Days' | '_3Days') {
    if (!process.env.COOKIE_KEY) {
      throw new Error('COOKIE_KEY environment variable is not set');
    }

    const url = `${COOKIE_API_BASE_URL}/v2/agents/contractAddress/${contractAddress}?interval=${interval}`;

    const response = await fetch(url, {
      headers: {
        accept: 'application/json',
        'x-api-key': process.env.COOKIE_KEY,
      },
    });

    if (!response.ok) {
      throw new CookieApiError(
        `API responded with status: ${response.status}`,
        response.status,
        interval
      );
    }

    const { ok } = await response.json();
    return ok;
  },

  async searchTweets(query: string, from: string, to: string) {
    const url = `${COOKIE_API_BASE_URL}/v1/hackathon/search/${encodeURIComponent(
      query
    )}?from=${from}&to=${to}`;

    const response = await fetch(url, {
      headers: {
        accept: 'application/json',
        'x-api-key': process.env.COOKIE_KEY!,
      },
    });

    if (!response.ok) {
      throw new CookieApiError(
        `Search API responded with status: ${response.status}`,
        response.status
      );
    }

    const { ok: searchResults } = await response.json();
    return searchResults;
  },
};
