import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

const CRON_SECRET = process.env.CRON_SECRET;

async function triggerAgentAnalysis() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/agents`,
    {
      method: 'POST',
    }
  );

  if (!response.ok) {
    throw new Error(`Agent analysis failed: ${response.statusText}`);
  }

  return response.json();
}

export async function POST() {
  const headersList = headers();
  const authHeader = (await headersList).get('authorization');

  // Verify the request is authorized
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await triggerAgentAnalysis();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Failed to run cron job' },
      { status: 500 }
    );
  }
}
