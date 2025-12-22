import { NextResponse } from 'next/server';
import { calculateDailyStudy } from '@/lib/hebrew-calendar';

/**
 * GET /api/study/today
 * Returns the daily study schedule (Parsha, Daf Yomi, etc.) for the current date.
 * Optional query param: ?date=YYYY-MM-DD to fetch a specific day.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    
    // Use provided date or default to today
    const date = dateParam ? new Date(dateParam) : new Date();
    
    // Calculate the study schedule using our utility
    const data = calculateDailyStudy(date);

    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error fetching daily study data:', error);
    return NextResponse.json(
      { error: 'Failed to calculate daily study data' },
      { status: 500 }
    );
  }
}