import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Use local path for development, RPi path for production
const UPDATE_FILE_PATH = process.env.NODE_ENV === 'development'
  ? path.join(process.cwd(), '.update_available.json')
  : '/home/beluga/beluga_backend/.update_available.json';

export async function GET() {
  try {
    // Check if update file exists
    if (existsSync(UPDATE_FILE_PATH)) {
      const fileContents = await readFile(UPDATE_FILE_PATH, 'utf-8');
      const data = JSON.parse(fileContents);
      return NextResponse.json(data, { status: 200 });
    } else {
      return NextResponse.json({ update_available: false }, { status: 200 });
    }
  } catch (error) {
    console.error('Error checking for updates:', error);
    return NextResponse.json({ update_available: false }, { status: 200 });
  }
}
