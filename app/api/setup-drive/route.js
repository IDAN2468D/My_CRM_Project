import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function GET(req) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/setup-drive/callback`
  );

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Request a refresh token
    prompt: 'consent', // Force consent screen to get refresh token
    scope: ['https://www.googleapis.com/auth/drive.file'],
  });

  return NextResponse.redirect(url);
}
