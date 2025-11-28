import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST() {
  try {
    // Development mode: Simulate update trigger
    if (process.env.NODE_ENV === 'development') {
      console.log('[DEV MODE] Simulating systemd service trigger...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      return NextResponse.json({
        success: true,
        message: 'Update started in background (simulated)',
        timestamp: new Date().toISOString()
      }, { status: 202 });
    }

    // Production: Check if update is already running
    try {
      const { stdout: statusOutput } = await execAsync('systemctl is-active beluga-self-update.service');
      if (statusOutput.trim() === 'active') {
        return NextResponse.json({
          success: false,
          error: 'Update already in progress',
          timestamp: new Date().toISOString()
        }, { status: 409 }); // 409 Conflict
      }
    } catch (err) {
      // Service not active (expected) - continue
    }

    // Trigger systemd service (returns immediately)
    // Use -n flag for non-interactive sudo (no TTY required)
    console.log('[UPDATE] Triggering beluga-self-update.service...');
    await execAsync('sudo -n systemctl start beluga-self-update.service');
    console.log('[UPDATE] Service started successfully');

    return NextResponse.json({
      success: true,
      message: 'Update started in background',
      timestamp: new Date().toISOString()
    }, { status: 202 });

  } catch (error) {
    console.error('[UPDATE ERROR]', error);

    // More specific error messages
    const errorMessage = error instanceof Error ? error.message : 'Failed to start update';
    const isSudoError = errorMessage.includes('sudo') || errorMessage.includes('permission');

    return NextResponse.json({
      success: false,
      error: isSudoError
        ? 'Permission denied. Check sudo configuration for beluga user.'
        : 'Failed to start update service',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
