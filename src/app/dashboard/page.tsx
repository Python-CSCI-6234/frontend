'use client';

import EmailDashboard from "@/components/EmailDashboard";
import { MessageThreadPanel } from "@/components/ui/message-thread-panel";
import UserPreferences from "@/components/UserPreferences";

export default function DashboardPage() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="flex flex-col items-center sm:items-start">
          <h1 className="text-2xl font-bold">Welcome to the Mailbot</h1>
          <p className="text-gray-600">
            The Mailbot is a tool that helps you manage your email.
          </p>
          <EmailDashboard />
          <UserPreferences />
          <div className="w-full min-w-xl">
            <MessageThreadPanel contextKey="tambo-template" />
          </div>
        </div>
      </main>
    </div>
  );
} 