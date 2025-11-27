import { NextResponse } from 'next/server';

const LIGHTSAIL_WEBHOOK_URL = process.env.LIGHTSAIL_WEBHOOK_URL || 'http://100.120.139.108:5000/trigger-update';
const WEBHOOK_AUTH_TOKEN = process.env.WEBHOOK_AUTH_TOKEN || '';
const MACHINE_ID = process.env.MACHINE_ID || '';

export async function POST() {
  try {
    // Optional: Check machine state once
    // For now, we'll trust the frontend checked before calling

    if (!WEBHOOK_AUTH_TOKEN) {
      return NextResponse.json({
        success: false,
        error: 'Webhook authentication token not configured'
      }, { status: 500 });
    }

    // Call Lightsail webhook
    const response = await fetch(LIGHTSAIL_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WEBHOOK_AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ machine_id: MACHINE_ID })
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        success: true,
        message: 'Update started successfully',
        data
      }, { status: 200 });
    } else {
      const errorText = await response.text();
      return NextResponse.json({
        success: false,
        error: `Webhook returned status ${response.status}: ${errorText}`
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error triggering update:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
