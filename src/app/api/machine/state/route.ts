import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // For now, return a simple idle state
    // TODO: Integrate with actual machine state from backend/socket
    // This should be connected to the Zustand store's activeRunId

    return NextResponse.json({
      state: 'idle',
      test_running: false,
      current_cycle: null,
      estimated_completion: null
    }, { status: 200 });
  } catch (error) {
    console.error('Error getting machine state:', error);
    return NextResponse.json({
      state: 'unknown',
      test_running: false,
      current_cycle: null,
      estimated_completion: null
    }, { status: 500 });
  }
}
