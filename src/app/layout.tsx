"use client";
// import { ProductCard } from "@/components/product-card";
// import { TamboComponent } from "@tambo-ai/react";
import { TamboProvider } from "@tambo-ai/react";
import "./globals.css";
import { components } from "@/lib/tambo";
import { Providers } from './providers';
import { SessionProvider } from 'next-auth/react';
import { DM_Sans } from 'next/font/google';

const dmSans = DM_Sans({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={dmSans.className}>
      <body>
        <Providers>
          <SessionProvider>
            <TamboProvider
              apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
              components={components}
            >
              {children}
            </TamboProvider>
          </SessionProvider>
        </Providers>
      </body>
    </html>
  );
}
