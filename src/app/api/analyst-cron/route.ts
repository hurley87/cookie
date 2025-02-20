import { NextResponse } from 'next/server';

export async function GET() {
  console.log('Analyst cron job executed!');

  try {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/analyst`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error executing cron job:', error);
  }

  return NextResponse.json({ message: 'Cron job executed successfully!' });
}
