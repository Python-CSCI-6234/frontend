import { useApi } from '@/hooks/useApi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UserPreferences } from '@/types/api';
import { useState, useEffect } from 'react';

export default function UserPreferences() {
  const api = useApi();
  const queryClient = useQueryClient();
  const [timezone, setTimezone] = useState('');
  const [digestTime, setDigestTime] = useState('');
  const [digestEnabled, setDigestEnabled] = useState(true);

  const { data: preferences, isLoading } = useQuery<UserPreferences>({
    queryKey: ['preferences'],
    queryFn: async () => {
      if (!api) {
        throw new Error('API client not available');
      }
      const response = await api.updatePreferences({
        timezone: '',
        digest_time: '',
        digest_enabled: true,
      });
      return response.preferences;
    },
  });

  useEffect(() => {
    if (preferences) {
      setTimezone(preferences.timezone);
      setDigestTime(preferences.digest_time);
      setDigestEnabled(preferences.digest_enabled);
    }
  }, [preferences]);

  const updatePreferencesMutation = useMutation({
    mutationFn: (newPreferences: UserPreferences) => {
      if (!api) {
        throw new Error('API client not available');
      }
      return api.updatePreferences(newPreferences);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preferences'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePreferencesMutation.mutate({
      timezone,
      digest_time: digestTime,
      digest_enabled: digestEnabled,
    });
  };

  if (isLoading) {
    return <div>Loading preferences...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">User Preferences</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
            Timezone
          </label>
          <select
            id="timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Select a timezone</option>
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
          </select>
        </div>

        <div>
          <label htmlFor="digestTime" className="block text-sm font-medium text-gray-700">
            Daily Digest Time
          </label>
          <input
            type="time"
            id="digestTime"
            value={digestTime}
            onChange={(e) => setDigestTime(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="digestEnabled"
            checked={digestEnabled}
            onChange={(e) => setDigestEnabled(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="digestEnabled" className="ml-2 block text-sm text-gray-900">
            Enable Daily Digest
          </label>
        </div>

        <button
          type="submit"
          disabled={updatePreferencesMutation.isPending}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {updatePreferencesMutation.isPending ? 'Saving...' : 'Save Preferences'}
        </button>
      </form>
    </div>
  );
} 