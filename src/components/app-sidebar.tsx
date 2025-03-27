"use client";
import { SignInButton, SignedIn, SignedOut, UserButton, useAuth } from "@clerk/nextjs";
// import { auth } from "@clerk/nextjs/server";

import { loadSessionsByUserId } from "~/lib/session-store";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Button } from "./ui/button";
import { NewChatButton, ConversationGroup } from "./sidebar-buttons";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "~/components/ui/sidebar";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface Conversation {
  sessionId: string;
  userId: string;
  sessionTitle: string | null;
  createdAt: Date | string;
}

// Helper function to group conversations by time periods
function groupConversationsByTime(conversations: Conversation[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  return {
    today: conversations.filter(conv => {
      const convDate = new Date(conv.createdAt);
      return convDate >= today;
    }),
    yesterday: conversations.filter(conv => {
      const convDate = new Date(conv.createdAt);
      return convDate >= yesterday && convDate < today;
    }),
    pastWeek: conversations.filter(conv => {
      const convDate = new Date(conv.createdAt);
      return convDate >= oneWeekAgo && convDate < yesterday;
    }),
    pastMonth: conversations.filter(conv => {
      const convDate = new Date(conv.createdAt);
      return convDate >= oneMonthAgo && convDate < oneWeekAgo;
    }),
    older: conversations.filter(conv => {
      const convDate = new Date(conv.createdAt);
      return convDate < oneMonthAgo;
    }),
  };
}

// Helper function to render a group of conversations
// function ConversationGroup({ 
//   title, 
//   conversations, 
//   isFirst = false,
//   fullConversations
// }: { 
//   title: string; 
//   conversations: Conversation[]; 
//   isFirst?: boolean;
//   fullConversations?: Conversation[];
// }) {
//   if (conversations.length === 0) return null;
  
//   return (
//     <SidebarGroup className={`${isFirst ? 'mt-1' : 'mt-4'} flex max-w-[18rem] flex-col gap-[2px] px-4 md:max-w-[16rem]`}>
//       <div className="px-1 text-xs font-semibold text-muted-foreground">{title}</div>
//       {isFirst && <NewSessionTab sessions={fullConversations ?? []} />}
//       {conversations.map((conversation) => (
//         <SidebarTab
//           conversation={conversation}
//           key={conversation.sessionId}
//         />
//       ))}
//     </SidebarGroup>
//   );
// }

export function AppSidebar(): JSX.Element {
  const { userId } = useAuth();
  const currentPath = usePathname();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null | undefined>(
    currentPath.startsWith("/chat/") ? currentPath.split("/")[2] : null
  );
  const groupedConversations = groupConversationsByTime(conversations);

  useEffect(() => {
    if (userId) {
      loadSessionsByUserId(userId)
      .then((sessions) => {
        setConversations(sessions);
      })
      .catch((error) => {
        console.error("Error loading sessions:", error);
      });
    }
  }, [userId]);

  return (
    <Sidebar className="border-r-[1px] border-sidebar-border">
      <SidebarHeader className="mt-2 px-4">
        <NewChatButton setActiveSessionId={setActiveSessionId} />
      </SidebarHeader>
      <SidebarContent className="relative max-w-full">
        <ScrollArea className="relative h-full w-full">
            <ConversationGroup 
              title="Today" 
              conversations={groupedConversations.today} 
              isFirst={true}
              fullConversations={conversations}
              activeSessionId={activeSessionId}
              setActiveSessionId={setActiveSessionId}
            />
            <ConversationGroup 
              title="Yesterday" 
              conversations={groupedConversations.yesterday}
              activeSessionId={activeSessionId}
              setActiveSessionId={setActiveSessionId}
            />
            <ConversationGroup 
              title="Past Week" 
              conversations={groupedConversations.pastWeek}
              activeSessionId={activeSessionId}
              setActiveSessionId={setActiveSessionId}
            />
            <ConversationGroup 
              title="Past Month" 
              conversations={groupedConversations.pastMonth} 
              activeSessionId={activeSessionId}
              setActiveSessionId={setActiveSessionId}
            />
            <ConversationGroup 
              title="Older" 
              conversations={groupedConversations.older} 
              activeSessionId={activeSessionId}
              setActiveSessionId={setActiveSessionId}
            />
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter className="flex h-16 items-center justify-center border-t-[1px] border-sidebar-border py-4">
        <SignedIn>
          <div className="flex w-full items-center px-4">
            <UserButton
              appearance={{
                elements: {
                  userButtonBox:
                    "w-full flex items-center justify-center gap-1 flex-row-reverse text-foreground",
                  userButtonPopupCard: "z-[200]",
                  userButtonPopoverActionButton: "z-[200]"
                },
              }}
              showName
              userProfileMode="navigation"
              userProfileUrl="/settings"
            />
          </div>
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <Button className="h-full w-40">Sign in</Button>
          </SignInButton>
        </SignedOut>
      </SidebarFooter>
    </Sidebar>
  );
}
