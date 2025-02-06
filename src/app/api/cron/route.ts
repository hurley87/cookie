import { NextResponse } from 'next/server';

export async function GET() {
  console.log('Cron job executed!');
  // Your cron logic here

  return NextResponse.json({ message: 'Cron job executed successfully!' });
}
