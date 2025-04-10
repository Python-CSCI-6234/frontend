/**
 * @file tambo.ts
 * @description Central configuration file for Tambo components and tools
 *
 * This file serves as the central place to register your Tambo components and tools.
 * It exports arrays that will be used by the TamboProvider.
 *
 * Read more about Tambo at https://tambo.co/docs
 */

import { getProducts } from "@/services/product-service";
import type { TamboComponent } from "@tambo-ai/react";
import { TamboTool } from "@tambo-ai/react";
import { z } from "zod";
import GmailLabelManager from "@/components/GmailLabelManager";
import EmailDashboard from "@/components/EmailDashboard";
import DailyDigestSettings from "@/components/DailyDigestSettings";

/**
 * Tools for API integration
 */

// Tool for fetching products (example)
export const productsTool: TamboTool = {
  name: "products",
  description: "A tool to get products from the database",
  tool: getProducts,
  toolSchema: z.function().returns(
    z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        price: z.number(),
        discountPercentage: z.number().optional(),
        accentColor: z.string(),
        inStock: z.boolean().optional(),
      })
    )
  ),
};

// Tool for managing Gmail labels
export const emailLabelsTool: TamboTool = {
  name: "emailLabels",
  description: "A tool to manage Gmail labels - fetch, create, update, and delete labels",
  tool: async () => {
    const response = await fetch('/api/labels');
    return response.json();
  },
  toolSchema: z.function().returns(
    z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        type: z.enum(["system", "user"]),
        color: z.object({
          backgroundColor: z.string(),
          textColor: z.string(),
        }).optional(),
      })
    )
  ),
};

// Tool for creating a new Gmail label
export const createLabelTool: TamboTool = {
  name: "createLabel",
  description: "A tool to create a new Gmail label with a specified name",
  tool: async (name: string) => {
    const response = await fetch('/api/labels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    return response.json();
  },
  toolSchema: z.function()
    .args(z.string())
    .returns(
      z.object({
        id: z.string(),
        name: z.string(),
        type: z.literal("user"),
        color: z.object({
          backgroundColor: z.string(),
          textColor: z.string(),
        }).optional(),
      })
    ),
};

// Tool for updating a Gmail label
export const updateLabelTool: TamboTool = {
  name: "updateLabel",
  description: "A tool to update an existing Gmail label",
  tool: async (labelData: { id: string, name: string }) => {
    const response = await fetch(`/api/labels/${labelData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: labelData.name })
    });
    return response.json();
  },
  toolSchema: z.function()
    .args(
      z.object({
        id: z.string(),
        name: z.string(),
      })
    )
    .returns(
      z.object({
        id: z.string(),
        name: z.string(),
        type: z.enum(["system", "user"]),
        color: z.object({
          backgroundColor: z.string(),
          textColor: z.string(),
        }).optional(),
      })
    ),
};

// Tool for deleting a Gmail label
export const deleteLabelTool: TamboTool = {
  name: "deleteLabel",
  description: "A tool to delete a Gmail label by its ID",
  tool: async (id: string) => {
    const response = await fetch(`/api/labels/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  },
  toolSchema: z.function()
    .args(z.string())
    .returns(
      z.object({
        success: z.boolean(),
        message: z.string(),
      })
    ),
};

// Tool for fetching emails from Gmail
export const emailsFetchTool: TamboTool = {
  name: "fetchEmails",
  description: "A tool to fetch emails from Gmail with pagination options",
  tool: async (count: number = 10) => {
    const response = await fetch(`/api/emails/fetch?count=${count}`);
    return response.json();
  },
  toolSchema: z.function()
    .args(z.number().optional())
    .returns(
      z.object({
        emails: z.array(
          z.object({
            id: z.string(),
            subject: z.string(),
            from: z.string(),
            date: z.string(),
            body: z.string(),
            labelIds: z.array(z.string()).optional(),
          })
        )
      })
    ),
};

// Tool for applying labels to an email
export const applyLabelsTool: TamboTool = {
  name: "applyLabels",
  description: "A tool to apply one or more labels to a specific email",
  tool: async (data: { emailId: string, labelIds: string[] }) => {
    const response = await fetch('/api/emails/labels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },
  toolSchema: z.function()
    .args(
      z.object({
        emailId: z.string(),
        labelIds: z.array(z.string()),
      })
    )
    .returns(
      z.object({
        success: z.boolean(),
        message: z.string(),
      })
    ),
};

// Tool for removing labels from an email
export const removeLabelsTool: TamboTool = {
  name: "removeLabels",
  description: "A tool to remove one or more labels from a specific email",
  tool: async (data: { emailId: string, labelIds: string[] }) => {
    const response = await fetch('/api/emails/labels', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },
  toolSchema: z.function()
    .args(
      z.object({
        emailId: z.string(),
        labelIds: z.array(z.string()),
      })
    )
    .returns(
      z.object({
        success: z.boolean(),
        message: z.string(),
      })
    ),
};

// Tool for saving user preferences
export const updatePreferencesTool: TamboTool = {
  name: "updatePreferences",
  description: "A tool to update user preferences for daily digests and notifications",
  tool: async (preferences: { timezone: string, digest_time: string, digest_enabled: boolean }) => {
    const response = await fetch('/api/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(preferences)
    });
    return response.json();
  },
  toolSchema: z.function()
    .args(
      z.object({
        timezone: z.string(),
        digest_time: z.string(),
        digest_enabled: z.boolean(),
      })
    )
    .returns(
      z.object({
        status: z.string(),
        preferences: z.object({
          timezone: z.string(),
          digest_time: z.string(),
          digest_enabled: z.boolean(),
        }),
      })
    ),
};

// Tool for sending email notifications
export const sendEmailNotificationTool: TamboTool = {
  name: "sendEmailNotification",
  description: "A tool to set up email notifications to a specified email address",
  tool: async (data: { email_address: string }) => {
    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: '',
        email_address: data.email_address,
        email_data: { emails: [] }
      })
    });
    return response.json();
  },
  toolSchema: z.function()
    .args(
      z.object({
        email_address: z.string(),
      })
    )
    .returns(
      z.object({
        message: z.string(),
        resend_response: z.object({
          id: z.string(),
        }),
      })
    ),
};

/**
 * components
 *
 * This array contains all the Tambo components that are registered for use within the application.
 * Each component is defined with its name, description, and expected props. The components
 * can be controlled by AI to dynamically render UI elements based on user interactions.
 */
export const components: TamboComponent[] = [
  {
    name: "GmailLabelManager",
    description: "A component for managing Gmail labels. Allows users to create, edit, and delete custom labels for organizing emails.",
    component: GmailLabelManager,
    propsSchema: z.object({}), // No props needed as it manages state internally
    associatedTools: [emailLabelsTool, createLabelTool, updateLabelTool, deleteLabelTool],
  },
  {
    name: "EmailDashboard",
    description: "A comprehensive email management dashboard for viewing and organizing Gmail emails. Shows email list and details with label management options.",
    component: EmailDashboard,
    propsSchema: z.object({
      initialEmailCount: z.number().optional().describe("The initial number of emails to load, defaults to 10"),
      showLabels: z.boolean().optional().describe("Whether to show label management options, defaults to true"),
      isCompact: z.boolean().optional().describe("Whether to use compact view for emails, defaults to false"),
    }),
    associatedTools: [emailsFetchTool, emailLabelsTool, applyLabelsTool, removeLabelsTool],
  },
  {
    name: "DailyDigestSettings",
    description: "A settings panel for configuring daily email digest preferences. Allows users to set email address, time, timezone, and toggle digest functionality.",
    component: DailyDigestSettings,
    propsSchema: z.object({
      defaultTime: z.string().optional().describe("Default time for the daily digest (format: HH:MM), defaults to 08:00"),
      defaultTimezone: z.string().optional().describe("Default timezone for the daily digest, defaults to UTC"),
      defaultEnabled: z.boolean().optional().describe("Whether daily digest is enabled by default, defaults to true"),
    }),
    associatedTools: [updatePreferencesTool, sendEmailNotificationTool],
  },
];

// Export all tools as a single array
export const tools: TamboTool[] = [
  productsTool,
  emailLabelsTool,
  createLabelTool,
  updateLabelTool,
  deleteLabelTool,
  emailsFetchTool,
  applyLabelsTool,
  removeLabelsTool,
  updatePreferencesTool,
  sendEmailNotificationTool
];
