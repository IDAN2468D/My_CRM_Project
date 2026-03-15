import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function GET(req) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'No authorization code found.' });
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/setup-drive/callback`
    );

    const { tokens } = await oauth2Client.getToken(code);
    
    // Return a nice HTML page with instructions for the user to copy their refresh token
    const html = `
      <html>
        <body style="font-family: sans-serif; text-align: center; padding: 50px; background: #f8fafc;" dir="rtl">
          <h1 style="color: #16a34a;">התחברות לגוגל דרייב הושלמה בהצלחה! 🎉</h1>
          <p style="font-size: 18px">העתק את הקוד הארוך למטה, והדבק אותו בקובץ <b>.env.local</b> תחת הערך <b>GOOGLE_REFRESH_TOKEN</b></p>
          
          <div style="background: white; padding: 20px; border-radius: 12px; margin-top: 20px; border: 2px solid #e2e8f0; font-family: monospace; word-break: break-all; font-weight: bold; color: #334155; font-size: 16px;">
            ${tokens.refresh_token || 'לא סופק REFRESH TOKEN! (זה קורה אם כבר אישרת בעבר בלי consent. מחק לאפליקציה ב-Google את ההרשאה ונסה שוב)'}
          </div>
          <br />
          <p>ואז עשה <code>npm run dev</code> בטרמינל כדי לאפס.</p>
        </body>
      </html>
    `;

    return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });

  } catch (error) {
    console.error('Error getting token', error);
    return NextResponse.json({ error: 'Failed to retrieve access token' }, { status: 500 });
  }
}
