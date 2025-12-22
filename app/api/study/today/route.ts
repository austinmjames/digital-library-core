import { NextResponse } from 'next/server';
import { calculateDailyStudy } from '@/lib/hebrew-calendar';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    const zipParam = searchParams.get('zip') || "10018";
    
    const date = dateParam ? new Date(dateParam) : new Date();
    const data = calculateDailyStudy(date, zipParam);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching daily study data:', error);
    return NextResponse.json(
      { error: 'Failed to calculate daily study data' },
      { status: 500 }
    );
  }
}