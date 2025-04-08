API Documentation for Frontend Development


1. Authentication Flow
Initial Authentication
GET https://mailbot.up.railway.app/auth/google
Purpose: Initiates Google OAuth flow
Response: Redirects to Google login page


Auth Callback
GET https://mailbot.up.railway.app/auth/google/callback


Response: {
  "user_info": {
    "id": "string",
    "email": "string",
    "verified_email": true,
    "name": "string",
    "given_name": "string",
    "family_name": "string",
    "picture": "link"
  },
  "credentials": {
    "access_token": "string",
    "refresh_token": "string",
    "token_expiry": "string", //ISO format
    "scopes": [
      "openid",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/gmail.readonly"
    ]
  }
}
⚠️ Important: Store the access_token securely - it's needed for all other API calls


2. Email Management
Fetch Emails
GET https://mailbot.up.railway.app/api/emails/fetch?token={access_token}


Response: {
    "emails": [
        {
            "id": string,
            "subject": string,
            "from": string,
            "date": string,
            "body": string
        }
    ]
}


Summarize Emails
POST https://mailbot.up.railway.app/api/emails/summarize
Content-Type: application/json


Request Body: {
    "emails": [
        {
            "id": string,
            "subject": string,
            "from": string,
            "date": string,
            "body": string
        }
    ]
}


Response: {
    "total_emails": number,
    "categories": {
        "work": Email[],
        "personal": Email[],
        "newsletters": Email[],
        "other": Email[],
        "important": Email[]
    },
    "important_emails": Email[],
    "summary_text": string,
    "processed_at": string // ISO date
}


3. Notifications
Send Email Notification
POST https://mailbot.up.railway.app/api/notifications
Content-Type: application/json


Request Body: {
    "token": string,
    "email_address": string,
    "email_data": {
        "emails": Email[]
    }
}


Response: {
    "message": "Notification sent successfully",
    "resend_response": {
        "id": "004a20a6-2b81-4934-ac78-aea4399b6057" //example
    }
}


4. Daily Digest
Get Daily Digest
GET https://mailbot.up.railway.app/api/digest?token={access_token}


Response: {
    "daily_digest": {
        "overview": {
            "description": string,
            "total_emails_processed": string,
            "main_topics": string[]
        },
        "important_updates_and_announcements": {
            "updates": string[],
            "announcements": string[],
            "notes": string
        },
        "action_items_and_follow_ups": {
            "key_action_items": string[],
            "follow_ups": string[],
            "deadlines": string
        },
        "key_discussions_and_decisions": {
            "discussions": string[],
            "decisions": string[],
            "notes": string
        },
        "additional_notes": string
    }
}


5. User Preferences
Update Preferences
POST https://mailbot.up.railway.app/api/preferences?token={access_token}
Content-Type: application/json


Request Body: {
    "timezone": string,  // e.g., "America/New_York"
    "digest_time": string, // 24-hour format, e.g., "09:00"
    "digest_enabled": boolean
}


Response: {
    "status": "success",
    "preferences": {
        "timezone": string,
        "digest_time": string,
        "digest_enabled": boolean
    }
}


Frontend Implementation Guidelines

1. Authentication
    - Implement OAuth flow with Google
    - Store access token securely (e.g., in HttpOnly cookies or secure localStorage)
    - Handle token expiration and refresh

2. Required Pages/Components
    - Login/Authentication page
    - Email dashboard
        ~ Email list view
        ~ Email categories
        ~ Summary section
    - Preferences settings page
    - Notifications center
    - Daily digest view

3. Suggested Features
    - Loading states for API calls
    - Error handling and user feedback
    - Responsive design for mobile/desktop
    - Real-time updates for new emails
    - Toast notifications for successful actions

4. Error Handling
    - Handle common HTTP status codes:
        ~ 400: Bad request
        ~ 401: Unauthorized
        ~ 404: Not found
        ~ 500: Server error
    - Implement retry logic for failed requests
    - Show user-friendly error messages

5. Security Considerations
    - Never store tokens in plain text
    - Implement CSRF protection
    - Use HTTPS for all API calls
    - Sanitize user inputs
    - Implement proper logout functionality
    - Performance Tips
    - Implement caching for email data

6. Use pagination for email lists
    - Implement debouncing for frequent API calls
    - Optimize bundle size


Frontend basic information

Framework: Next.js
Hosted on: vercel

- Chat interface
- Login page
- Settings page
    - Categories/Labels
    - Logout/user profile
    - Notifications
    - Daily email digest settings
    - Summary- this can be merged with daily email digest?





