import { ScrollArea } from "~/components/ui/scroll-area";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
import { AppSidebar } from "~/components/app-sidebar";
import { SidebarRefreshProvider } from "~/context/sidebar-refresh-context";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarRefreshProvider>
      <SidebarProvider className="min-w-screen min-h-[100dvh] max-h-[100dvh]">
        <AppSidebar />
        <main className="relative box-border flex min-h-full w-full flex-col">
          <div className="absolute top-0 z-20 p-4">
            <SidebarTrigger className="bg-background" />
          </div>
          <ScrollArea className="h-full max-h-full">{children}</ScrollArea>
        </main>
      </SidebarProvider>
    </SidebarRefreshProvider>
  );
}
