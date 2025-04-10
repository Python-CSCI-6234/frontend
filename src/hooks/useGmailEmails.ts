import { Email } from '@/types/api';
import { useQuery } from '@tanstack/react-query';

export function useGmailEmails() {
  const fetchGmailEmails = async (): Promise<{ emails: Email[] }> => {
    const response = await fetch('/api/emails/fetch');
    
    if (!response.ok) {
      throw new Error('Failed to fetch emails from Gmail');
    }
    
    return response.json();
  };

  return useQuery({
    queryKey: ['gmailEmails'],
    queryFn: fetchGmailEmails,
  });
} 