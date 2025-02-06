import { base } from '../../../lib/agents';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { agentAnalysisSchema } from '../../../lib/schemas/agent-analysis';
import {
  getSystemPrompt,
  generateAnalysisPrompt,
} from '../../../lib/prompts/agent-analysis';
import { cookieApi } from '../../../lib/services/cookie-api';
import { supabaseService } from '../../../lib/services/supabase';
import { AgentAnalysisRecord } from '../../../types/agent';

const formatDate = (date: Date) => date.toISOString().split('T')[0];

async function fetchAgentData(contractAddress: string) {
  const [sevenDaysData, threeDaysData] = await Promise.all([
    cookieApi.fetchAgentData(contractAddress, '_7Days'),
    cookieApi.fetchAgentData(contractAddress, '_3Days'),
  ]);

  return {
    _7Days: sevenDaysData,
    _3Days: threeDaysData,
  };
}

async function fetchTweets(twitterUsername: string) {
  const to = formatDate(new Date());
  const from = formatDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000));

  const tweets = await cookieApi.searchTweets(`@${twitterUsername}`, from, to);

  return tweets.map(
    (result: any) =>
      `Tweet: "${result.text}" has ${result.engagementsCount} engagements and ${result.smartEngagementPoints} smart engagements.\n\n`
  );
}

export async function POST() {
  const randomIndex = Math.floor(Math.random() * base.length);
  const contractAddress = base[randomIndex];

  try {
    // Fetch cookie data
    const cookieData = await fetchAgentData(contractAddress);
    const twitterUsername = cookieData._7Days?.twitterUsernames[0];
    console.log('twitterUsername', twitterUsername);

    if (!twitterUsername) {
      return Response.json(
        { error: 'Twitter username not found' },
        { status: 400 }
      );
    }

    // Fetch and process tweets
    const tweets = await fetchTweets(twitterUsername);

    // Generate analysis
    const { object: analysis } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: agentAnalysisSchema,
      system: getSystemPrompt(),
      prompt: generateAnalysisPrompt(cookieData, tweets),
    });
    console.log('analysis', analysis);

    // Prepare record
    const record: AgentAnalysisRecord = {
      contract_address: contractAddress,
      name: cookieData._7Days?.agentName || '',
      twitter: twitterUsername,
      _7Days: cookieData._7Days,
      _3Days: cookieData._3Days,
      tweets,
      analysis,
      updated_at: new Date().toISOString(),
    };

    // Save to database
    const data = await supabaseService.upsertAgentAnalysis(record);
    return Response.json(data);
  } catch (error) {
    console.error('API error:', error);
    return Response.json(
      { error: 'Failed to perform analysis' },
      { status: 500 }
    );
  }
}
