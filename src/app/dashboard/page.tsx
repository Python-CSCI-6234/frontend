'use client';

import { MessageThreadFull } from "@/components/ui/message-thread-full";
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter
} from "@/components/ui/sidebar";
import { InboxIcon, SettingsIcon, ArchiveIcon, LogOutIcon } from "lucide-react";
import EmailDashboard from "@/components/EmailDashboard";
import GmailLabelManager from "@/components/GmailLabelManager";
import DailyDigestSettings from "@/components/DailyDigestSettings";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeView, setActiveView] = useState<'inbox' | 'chat' | 'digest' | 'settings'>('chat');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  if (!session) {
    return null;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="h-screen w-full overflow-hidden flex">
        <Sidebar 
          variant="floating" 
          className="shadow-sm bg-white border-none"
        >
          <SidebarHeader className="border-b border-gray-100 p-4">
            <h2 className="text-xl font-bold flex items-center">
              <span className="bg-primary text-white p-1.5 rounded-md mr-2.5 shadow-sm">
                <InboxIcon className="h-4 w-4" />
              </span>
              mailbot
            </h2>
          </SidebarHeader>
          <SidebarContent className="flex-grow py-3 overflow-y-auto overflow-x-hidden">
            <SidebarMenu>
              <SidebarMenuButton
                isActive={activeView === 'inbox'}
                tooltip="Inbox"
                className="my-1.5 font-medium cursor-pointer hover:bg-gray-100 rounded-md mx-2 py-2.5 px-2 transition-all duration-200"
                onClick={() => setActiveView('inbox')}
              >
                <div className="flex items-center">
                  <InboxIcon className="mr-2.5 h-5 w-5 text-gray-500" />
                  <span className="text-gray-800">Inbox</span>
                </div>
              </SidebarMenuButton> 
              <SidebarMenuButton 
                isActive={activeView === 'digest'}
                tooltip="Digest"
                className="my-1.5 font-medium cursor-pointer hover:bg-gray-100 rounded-md mx-2 py-2.5 px-2 transition-all duration-200"
                onClick={() => setActiveView('digest')}
              >
                <div className="flex items-center">
                  <ArchiveIcon className="mr-2.5 h-5 w-5 text-gray-500" />
                  <span className="text-gray-700">Digest</span>
                </div>
              </SidebarMenuButton>
              <SidebarMenuButton 
                isActive={activeView === 'chat'}
                tooltip="AI Chat"
                className="my-1.5 font-medium cursor-pointer hover:bg-gray-100 rounded-md mx-2 py-2.5 px-2 transition-all duration-200"
                onClick={() => setActiveView('chat')}
              >
                <div className="flex items-center">
                  <ChatIcon className="mr-2.5 h-5 w-5 text-gray-500" />
                  <span className="text-gray-700">AI Chat</span>
                </div>
              </SidebarMenuButton>
              <SidebarMenuButton 
                isActive={activeView === 'settings'}
                tooltip="Settings"
                className="my-1.5 font-medium cursor-pointer hover:bg-gray-100 rounded-md mx-2 py-2.5 px-2 transition-all duration-200"
                onClick={() => setActiveView('settings')}
              >
                <div className="flex items-center">
                  <SettingsIcon className="mr-2.5 h-5 w-5 text-gray-500" />
                  <span className="text-gray-700">Settings</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-gray-200 bg-gray-50">
            {session.user?.name && (
              <div className="mb-4 px-1 flex items-center">
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-700 mr-3 border border-gray-200">
                  {session.user.name.charAt(0)}
                </div>
                <div className="truncate">
                  <div className="font-medium text-gray-800">{session.user.name}</div>
                  <div className="text-xs text-gray-500 truncate">{session.user.email}</div>
                </div>
              </div>
            )}
            <SidebarMenuButton
              tooltip="Sign Out"
              className="w-full justify-center text-gray-700 hover:text-red-600 hover:bg-red-50 cursor-pointer rounded-md transition-all duration-200 py-2 font-medium"
              onClick={handleSignOut}
            >
              <LogOutIcon className="h-4 w-4 mr-2" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1 p-4">
          {activeView === 'chat' && (
            <div className="h-full overflow-hidden">
              <MessageThreadFull 
                contextKey="tambo-template"
                className="!h-full !max-w-none !rounded-none !mx-0 !w-full !overflow-hidden"
              />
            </div>
          )}
          {activeView === 'inbox' && (
            <div className="h-full overflow-auto">
              <EmailDashboard />
            </div>
          )}
          {activeView === 'digest' && (
            <div className="h-full overflow-auto p-4">
              <h1 className="text-2xl font-bold mb-4">Email Digest</h1>
              <p>Your email digest configuration and history will appear here.</p>
              <DailyDigestSettings />
            </div>
          )}
          {activeView === 'settings' && (
            <div className="h-full overflow-auto">
              <GmailLabelManager />
            </div>
          )}
        </div>
        <SidebarTrigger className="fixed bottom-4 left-4 md:hidden" />
      </div>
    </SidebarProvider>
  );
}

const ChatIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
); 