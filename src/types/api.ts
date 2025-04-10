export interface Email {
  id: string;
  subject: string;
  from: string;
  date: string;
  body: string;
}

export interface EmailSummary {
  total_emails: number;
  categories: {
    work: Email[];
    personal: Email[];
    newsletters: Email[];
    other: Email[];
    important: Email[];
  };
  important_emails: Email[];
  summary_text: string;
  processed_at: string;
}

export interface DailyDigest {
  overview: {
    description: string;
    total_emails_processed: string;
    main_topics: string[];
  };
  important_updates_and_announcements: {
    updates: string[];
    announcements: string[];
    notes: string;
  };
  action_items_and_follow_ups: {
    key_action_items: string[];
    follow_ups: string[];
    deadlines: string;
  };
  key_discussions_and_decisions: {
    discussions: string[];
    decisions: string[];
    notes: string;
  };
  additional_notes: string;
}

export interface UserPreferences {
  timezone: string;
  digest_time: string;
  digest_enabled: boolean;
}

export interface NotificationRequest {
  token: string;
  email_address: string;
  email_data: {
    emails: Email[];
  };
} 