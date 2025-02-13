import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react"
import "~/styles/globals.css";

import { ThemeProvider } from "~/components/theme-provider";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { Toaster } from "~/components/ui/sonner";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
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
              {/* <main className="relative flex h-full w-full flex-col box-border">
                <div className="p-4 sticky top-0" >
                  <SidebarTrigger/>
                </div>
                {children}
              </main> */}
            </SidebarProvider>
            <Toaster />
          </ThemeProvider>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
