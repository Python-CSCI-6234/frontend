import { useApi } from '@/hooks/useApi';
import { useQuery } from '@tanstack/react-query';
import { Email, EmailSummary, DailyDigest } from '@/types/api';

export default function EmailDashboard() {
  const api = useApi();

  const { data: emails, isLoading: emailsLoading } = useQuery<{ emails: Email[] }>({
    queryKey: ['emails'],
    queryFn: () => {
      if (!api) {
        throw new Error('API client not available');
      }
      return api.fetchEmails();
    },
  });

  const { data: digest, isLoading: digestLoading } = useQuery<{ daily_digest: DailyDigest }>({
    queryKey: ['digest'],
    queryFn: () => {
      if (!api) {
        throw new Error('API client not available');
      }
      return api.getDailyDigest();
    },
  });

  const { data: summary, isLoading: summaryLoading } = useQuery<EmailSummary>({
    queryKey: ['summary'],
    queryFn: () => {
      if (!api) {
        throw new Error('API client not available');
      }
      return api.summarizeEmails(emails?.emails || []);
    },
    enabled: !!emails?.emails,
  });

  if (emailsLoading || digestLoading || summaryLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Email Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Recent Emails</h2>
          <ul className="space-y-2">
            {emails?.emails.map((email) => (
              <li key={email.id} className="border-b pb-2">
                <h3 className="font-medium">{email.subject}</h3>
                <p className="text-sm text-gray-600">{email.from}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Daily Digest</h2>
          <div className="space-y-2">
            <h3 className="font-medium">Overview</h3>
            <p className="text-sm">{digest?.daily_digest.overview.description}</p>
            
            <h3 className="font-medium mt-4">Important Updates</h3>
            <ul className="list-disc list-inside text-sm">
              {digest?.daily_digest.important_updates_and_announcements.updates.map((update, index) => (
                <li key={index}>{update}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {summary && (
        <div className="mt-4 bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Email Summary</h2>
          <p className="text-sm">{summary.summary_text}</p>
        </div>
      )}
    </div>
  );
} 