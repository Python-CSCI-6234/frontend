import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getToken } from 'next-auth/jwt';

export async function POST(req: NextRequest) {
  try {
    // Get the session token using getToken
    const token = await getToken({ req });
    
    if (!token || !token.accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const { emailId, labelIds } = await req.json();
    
    if (!emailId || !labelIds || !Array.isArray(labelIds)) {
      return NextResponse.json(
        { error: 'Missing or invalid emailId or labelIds' }, 
        { status: 400 }
      );
    }
    
    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: token.accessToken as string,
    });
    
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    
    // Apply the labels to the email
    await gmail.users.messages.modify({
      userId: 'me',
      id: emailId,
      requestBody: {
        addLabelIds: labelIds,
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error applying labels to email:', error);
    return NextResponse.json(
      { error: 'Failed to apply labels to email' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Get the session token using getToken
    const token = await getToken({ req });
    
    if (!token || !token.accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const { emailId, labelIds } = await req.json();
    
    if (!emailId || !labelIds || !Array.isArray(labelIds)) {
      return NextResponse.json(
        { error: 'Missing or invalid emailId or labelIds' }, 
        { status: 400 }
      );
    }
    
    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: token.accessToken as string,
    });
    
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    
    // Remove the labels from the email
    await gmail.users.messages.modify({
      userId: 'me',
      id: emailId,
      requestBody: {
        removeLabelIds: labelIds,
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing labels from email:', error);
    return NextResponse.json(
      { error: 'Failed to remove labels from email' }, 
      { status: 500 }
    );
  }
} 