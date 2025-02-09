import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { Toaster } from "~/components/ui/sonner"
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar"
import { AppSidebar } from "~/components/app-sidebar"

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
    <html lang="en" className={`${GeistSans.variable}`}>
      <body className="flex min-h-screen">
       <SidebarProvider className="min-w-screen min-h-screen">
        <AppSidebar />
        <main className="w-full h-full relative flex flex-col">
          <SidebarTrigger />
          {children}
        </main>
      </SidebarProvider>
      <Toaster />
      </body>
    </html>
  );
}
