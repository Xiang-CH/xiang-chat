import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "~/styles/globals.css";

import { ThemeProvider } from "~/components/theme-provider";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { Toaster } from "~/components/ui/sonner";
import { SidebarProvider } from "~/components/ui/sidebar";
import { AppSidebar } from "~/components/app-sidebar";

export const metadata: Metadata = {
  title: "Xiang-Chat",
  description: "A chat application",
  icons: [{ rel: "icon", url: "/logo.svg" }],
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${GeistSans.variable}`} suppressHydrationWarning>
        <body className="flex min-h-[100dvh] max-h-[100dvh]">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
          >
            <SidebarProvider className="min-w-screen min-h-full">
              <AppSidebar/>
              {children}
            </SidebarProvider>
            <Toaster />
          </ThemeProvider>
          <Analytics />
          <SpeedInsights/>
        </body>
      </html>
    </ClerkProvider>
  );
}
