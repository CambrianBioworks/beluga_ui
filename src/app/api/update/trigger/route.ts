import { NextResponse } from 'next/server';
import { spawn } from 'child_process';

const ANSIBLE_REPO = 'https://github.com/CambrianBioworks/ansible-beluga-deployment';
const ANSIBLE_BRANCH = 'main';
const PLAYBOOK = 'playbooks/self-update.yml';

export async function POST() {
  try {
    // Development mode: Simulate update trigger
    if (process.env.NODE_ENV === 'development') {
      console.log('[DEV MODE] Simulating ansible-pull trigger...');

      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      return NextResponse.json({
        success: true,
        message: 'Update started (simulated)',
        pid: 'dev-mode-12345'
      }, { status: 202 });
    }

    // Production mode: Trigger ansible-pull in background
    const ansiblePull = spawn(
      'ansible-pull',
      [
        '-U', ANSIBLE_REPO,
        '-C', ANSIBLE_BRANCH,
        '-i', 'localhost,',
        PLAYBOOK
      ],
      {
        detached: true,
        stdio: 'ignore'
      }
    );

    // Unref so it runs independently
    ansiblePull.unref();

    return NextResponse.json({
      success: true,
      message: 'Update started',
      pid: ansiblePull.pid
    }, { status: 202 });

  } catch (error) {
    console.error('Error triggering update:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to start update'
    }, { status: 500 });
  }
}
