import { ScrollArea } from "~/components/ui/scroll-area";
import { SidebarTrigger } from "~/components/ui/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative box-border flex min-h-full w-full flex-col">
        <div className="absolute top-0 p-4 z-20">
            <SidebarTrigger />
        </div>
      <ScrollArea>
        {children}
      </ScrollArea>
    </main>
  );
}
