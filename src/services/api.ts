import { Email, EmailSummary, DailyDigest, UserPreferences, NotificationRequest } from '@/types/api';

export class ApiClient {
  private baseUrl = 'https://mailbot.up.railway.app/api';
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  async fetchEmails(): Promise<{ emails: Email[] }> {
    return this.get('/emails/fetch');
  }

  async summarizeEmails(emails: Email[]): Promise<EmailSummary> {
    return this.post('/emails/summarize', { emails });
  }

  async getDailyDigest(): Promise<{ daily_digest: DailyDigest }> {
    return this.get('/digest');
  }

  async updatePreferences(preferences: UserPreferences): Promise<{ status: string; preferences: UserPreferences }> {
    return this.post('/preferences', preferences);
  }

  async sendEmailNotification(data: NotificationRequest): Promise<{ message: string; resend_response: { id: string } }> {
    return this.post('/notifications', data);
  }

  private async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}?token=${this.token}`);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    return response.json();
  }

  private async post<T, D extends object>(endpoint: string, data: D): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}?token=${this.token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    return response.json();
  }
} 