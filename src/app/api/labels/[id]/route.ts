import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { google } from 'googleapis';

// Delete a label
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the session token
    const token = await getToken({ req });
    
    if (!token || !token.accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Access the id from params, which is already resolved
    const labelId = params.id;
    
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
    
    // Delete the label
    await gmail.users.labels.delete({
      userId: 'me',
      id: labelId,
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting label:', error);
    return NextResponse.json(
      { error: 'Failed to delete label' },
      { status: 500 }
    );
  }
}

// Update a label
export async function PATCH(
  req: NextRequest,
) {
  try {
    const token = await getToken({ req });
    
    if (!token || !token.accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Access the id from params directly
    const url = req.url;
const parts = url.split('/');
const labelId = parts[parts.length - 1];
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
    
    // Update the label
    const response = await gmail.users.labels.patch({
      userId: 'me',
      id: labelId,
      requestBody: { name },
    });
    
    return NextResponse.json({ label: response.data });
  } catch (error) {
    console.error('Error updating label:', error);
    return NextResponse.json(
      { error: 'Failed to update label' },
      { status: 500 }
    );
  }
} 