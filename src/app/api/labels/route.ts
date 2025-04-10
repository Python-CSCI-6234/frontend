import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { google } from 'googleapis';

// Get all labels
export async function GET(req: NextRequest) {
  try {
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
    
    // Get labels
    const response = await gmail.users.labels.list({
      userId: 'me',
    });
    
    return NextResponse.json({ labels: response.data.labels || [] });
  } catch (error) {
    console.error('Error fetching labels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch labels' },
      { status: 500 }
    );
  }
}

// Create a new label
export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req });
    
    if (!token || !token.accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    const { name } = body;
    
    if (!name) {
      return NextResponse.json(
        { error: 'Label name is required' },
        { status: 400 }
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
    
    // Create a new label
    const response = await gmail.users.labels.create({
      userId: 'me',
      requestBody: { name },
    });
    
    return NextResponse.json({ label: response.data });
  } catch (error) {
    console.error('Error creating label:', error);
    return NextResponse.json(
      { error: 'Failed to create label' },
      { status: 500 }
    );
  }
} 