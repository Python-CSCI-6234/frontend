import { useApi } from '@/hooks/useApi';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { UserPreferences } from '@/types/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function DailyDigestSettings() {
  const api = useApi();
  const [emailAddress, setEmailAddress] = useState('');
  const [digestTime, setDigestTime] = useState('08:00');
  const [timezone, setTimezone] = useState('UTC');
  const [isEnabled, setIsEnabled] = useState(true);

  // Fetch existing preferences
  const { data: preferences } = useQuery<UserPreferences>({
    queryKey: ['preferences'],
    queryFn: async () => {
      if (!api) {
        throw new Error('API client not available');
      }
      const response = await api.updatePreferences({
        timezone: 'UTC',
        digest_time: '08:00',
        digest_enabled: true,
      });
      return response.preferences;
    },
  });

  // Update with existing preferences when loaded
  useEffect(() => {
    if (preferences) {
      setTimezone(preferences.timezone);
      setDigestTime(preferences.digest_time);
      setIsEnabled(preferences.digest_enabled);
    }
  }, [preferences]);

  // Save updated preferences
  const updatePreferencesMutation = useMutation({
    mutationFn: (newPreferences: UserPreferences) => {
      if (!api) {
        throw new Error('API client not available');
      }
      return api.updatePreferences(newPreferences);
    },
  });

  // Save notification email address and daily digest settings
  const saveDigestSettingsMutation = useMutation({
    mutationFn: async () => {
      if (!api) {
        throw new Error('API client not available');
      }
      
      // First update the preferences
      await updatePreferencesMutation.mutateAsync({
        timezone,
        digest_time: digestTime,
        digest_enabled: isEnabled,
      });
      
      // Then store the email for daily notifications
      return api.sendEmailNotification({
        token: '',
        email_address: emailAddress,
        email_data: { emails: [] },
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailAddress || !digestTime) return;
    saveDigestSettingsMutation.mutate();
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Daily Digest Settings</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email Address
            </label>
            <Input
              type="email"
              id="email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              placeholder="Where to send your daily digest"
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="digestTime" className="text-sm font-medium">
              Daily Digest Time
            </label>
            <Input
              type="time"
              id="digestTime"
              value={digestTime}
              onChange={(e) => setDigestTime(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="timezone" className="text-sm font-medium">
              Timezone
            </label>
            <select
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className={cn(
                "border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-all",
                "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                "outline-none disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isEnabled"
              checked={isEnabled}
              onChange={(e) => setIsEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/30"
            />
            <label htmlFor="isEnabled" className="text-sm">
              Enable Daily Digest
            </label>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Your daily email digest will be automatically sent to you each day at your specified time.
            </p>
          </div>

          <Button
            type="submit"
            disabled={saveDigestSettingsMutation.isPending || !emailAddress}
            className="w-full cursor-pointer"
            variant="default"
          >
            {saveDigestSettingsMutation.isPending ? 'Saving...' : 'Save Digest Settings'}
          </Button>

          {saveDigestSettingsMutation.isSuccess && (
            <div className="mt-2 text-sm text-green-600">
              Daily digest settings saved successfully!
            </div>
          )}

          {saveDigestSettingsMutation.isError && (
            <div className="mt-2 text-sm text-red-600">
              Failed to save settings. Please try again.
            </div>
          )}
        </form>
      </div>
    </div>
  );
} 