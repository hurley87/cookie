# Cookie AI Trading Platform

A sophisticated Next.js application that leverages AI to analyze and execute cryptocurrency trades based on agent behavior and market analysis.

## System Architecture

### Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, React
- **Backend**: Next.js API Routes, OpenAI GPT-4
- **Database**: Supabase
- **Trading Integration**: Coinbase CDP (Crypto Development Platform)

### Core Components

1. **Agent Analysis System**

   - Monitors and analyzes AI trading agents
   - Tracks mindshare, market cap, and volume metrics
   - Generates insights based on historical data

2. **Trading Engine**

   - AI-powered trade recommendation system
   - Automated trade execution via Coinbase CDP
   - Risk management and portfolio allocation

3. **Social Media Integration**
   - Automated tweet generation
   - Market sentiment analysis
   - Social engagement tracking

## API Endpoints

### Agent Analysis

#### `GET /api/analyst`

- Retrieves all agent analysis records
- Returns: Array of agent analysis data with metrics

#### `POST /api/analyst`

- Triggers analysis for a random agent
- Fetches agent data from Cookie API
- Analyzes tweets and market data
- Stores analysis results in database

### Trading

#### `GET /api/trader`

- Generates trade recommendations based on agent analysis
- Filters for high-conviction trades
- Normalizes allocation percentages
- Returns: Filtered recommendations and execution results

#### `POST /api/trade-execute`

- Executes trades via Coinbase CDP
- Parameters:
  - recommendation: Trade recommendation object
- Returns: Execution status and results

### Social Media

#### `GET /api/tweet-generator`

- Generates market analysis tweets
- Incorporates latest agent data and trades
- Stores tweets in database
- Returns: Generated tweet content

### Monitoring

#### `GET /api/analyst-cron`

- Endpoint for scheduled analysis tasks
- Triggers agent analysis pipeline
- Returns: Cron job execution status

## Development Setup

1. **Environment Setup**

   ```bash
   # Clone repository
   git clone [repository-url]

   # Install dependencies
   yarn install

   # Set up environment variables
   cp .env.example .env.local
   ```

2. **Required Environment Variables**

   ```
   NEXT_PUBLIC_APP_URL=
   API_KEY_NAME=
   API_KEY_PRIVATE_KEY=
   WALLET_DATA=
   NETWORK_ID=
   OPENAI_API_KEY=
   ```

3. **Development Server**

   ```bash
   yarn dev
   ```

4. **Build for Production**
   ```bash
   yarn build
   ```

## Security Considerations

- API keys and wallet data are securely managed via environment variables
- Trade execution requires proper authentication
- Rate limiting implemented on API endpoints
- Input validation using Zod schemas

## Performance Optimization

- Server-side rendering for data-heavy pages
- Optimized database queries with proper indexing
- Caching implemented for frequently accessed data
- Background processing for intensive operations

## Monitoring and Maintenance

- Error logging and monitoring via console
- Automated cron jobs for regular analysis
- Database backups and maintenance
- Performance monitoring and optimization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Create a Pull Request

## License

[License Information]
