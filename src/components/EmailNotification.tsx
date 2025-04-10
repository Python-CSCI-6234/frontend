import { useApi } from '@/hooks/useApi';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Email } from '@/types/api';

interface EmailNotificationProps {
  emails: Email[];
}

export default function EmailNotification({ emails }: EmailNotificationProps) {
  const api = useApi();
  const [emailAddress, setEmailAddress] = useState('');

  const sendNotificationMutation = useMutation({
    mutationFn: () => {
      if (!api) {
        throw new Error('API client not available');
      }
      return api.sendEmailNotification({
        token: '', // This will be handled by the API client
        email_address: emailAddress,
        email_data: { emails },
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailAddress) return;
    sendNotificationMutation.mutate();
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Send Email Notification</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <p className="text-sm text-gray-600">
            This will send a notification about {emails.length} email{emails.length !== 1 ? 's' : ''} to the specified address.
          </p>
        </div>

        <button
          type="submit"
          disabled={sendNotificationMutation.isPending || !emailAddress}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {sendNotificationMutation.isPending ? 'Sending...' : 'Send Notification'}
        </button>

        {sendNotificationMutation.isSuccess && (
          <div className="mt-2 text-sm text-green-600">
            Notification sent successfully!
          </div>
        )}

        {sendNotificationMutation.isError && (
          <div className="mt-2 text-sm text-red-600">
            Failed to send notification. Please try again.
          </div>
        )}
      </form>
    </div>
  );
} 