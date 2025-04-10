"use client";
// import { ProductCard } from "@/components/product-card";
// import { TamboComponent } from "@tambo-ai/react";
import { TamboProvider } from "@tambo-ai/react";
import "./globals.css";
import { components } from "@/lib/tambo";
import { Providers } from './providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <TamboProvider
            apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
            components={components}
          >
            {children}
          </TamboProvider>
        </Providers>
      </body>
    </html>
  );
}
