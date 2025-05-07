import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "~/styles/globals.css";

import { ThemeProvider } from "~/components/theme-provider";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { Toaster } from "~/components/ui/sonner";

export const metadata: Metadata = {
  title: "Xiang Chat",
  description: "A simple Chat App",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { rel: 'icon', url: '/icon0.svg', type: 'image/svg+xml', sizes: '800x800' },
      { rel: 'icon', url: '/favicon.ico', type: 'image/x-icon', sizes: '48x48' },
      { rel: 'icon', url: '/icon1.png', type: 'image/png', sizes: '96x96' },
    ],
    apple: [
      { rel: 'apple-touch-icon', url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Xiang Chat"
  },
};

// export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${GeistSans.variable}`}
        suppressHydrationWarning
      >

        <body className="flex">
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
            <Toaster />
          </ThemeProvider>
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  );
}
