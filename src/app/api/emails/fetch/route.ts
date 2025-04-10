import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { google } from 'googleapis';
import { Email } from '@/types/api';

export async function GET(req: NextRequest) {
  try {
    // Get the count parameter from the query
    const searchParams = req.nextUrl.searchParams;
    const count = Number(searchParams.get('count') || '10');
    
    // Get the session token
    const token = await getToken({ req });
    
    if (!token || !token.accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: token.accessToken as string,
    });
    
    // Create Gmail API client
    const gmail = google.gmail({
      version: 'v1',
      auth: oauth2Client,
    });
    
    // Get messages (emails)
    const res = await gmail.users.messages.list({
      userId: 'me',
      maxResults: count, // Use the count parameter
    });
    
    const messageIds = res.data.messages || [];
    const emails: Email[] = [];
    
    // Get details for each message
    await Promise.all(
      messageIds.map(async ({ id }) => {
        if (!id) return;
        
        const message = await gmail.users.messages.get({
          userId: 'me',
          id,
        });
        
        const headers = message.data.payload?.headers || [];
        
        // Extract email metadata
        const subject = headers.find(h => h.name === 'Subject')?.value || '';
        const from = headers.find(h => h.name === 'From')?.value || '';
        const date = headers.find(h => h.name === 'Date')?.value || '';
        
        // Extract email body (simplified version)
        let body = '';
        if (message.data.payload?.parts?.length) {
          const textPart = message.data.payload.parts.find(
            part => part.mimeType === 'text/plain'
          );
          if (textPart?.body?.data) {
            body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
          }
        } else if (message.data.payload?.body?.data) {
          body = Buffer.from(message.data.payload.body.data, 'base64').toString('utf-8');
        }
        
        emails.push({
          id,
          subject,
          from,
          date,
          body,
          labelIds: message.data.labelIds || [],
        });
      })
    );
    
    return NextResponse.json({ emails });
  } catch (error) {
    console.error('Error fetching emails:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emails' },
      { status: 500 }
    );
  }
} 