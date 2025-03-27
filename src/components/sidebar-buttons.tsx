"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SidebarGroup, SidebarMenuButton, useSidebar } from "./ui/sidebar";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { deleteSession, changeSessionTitle } from "~/lib/actions";
import { DotsHorizontalIcon, CaretDownIcon } from "@radix-ui/react-icons";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

export function SidebarTab({
  conversation,
}: {
  conversation: { sessionId: string | null; sessionTitle: string | null };
}) {
  const currentPath = usePathname();
  const router = useRouter();
  const { setOpenMobile } = useSidebar();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [sessionTitle, setSessionTitle] = useState(conversation.sessionTitle);
  const [renameTab, setRenameTab] = useState(false);
  const [isActive, setIsActive] = useState(
    currentPath === "/chat/" + conversation.sessionId,
  );

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsActive(true);
    setOpenMobile(false);
    router.refresh();
    setTimeout(() => {
      router.push(`/chat/${conversation.sessionId}`);
    }, 200);
  };

  useEffect(() => {
    setIsActive(currentPath === "/chat/" + conversation.sessionId);
  }, [currentPath]);

  async function handleRenameTab(e: React.FocusEvent<HTMLInputElement> | React.KeyboardEvent<HTMLInputElement>) {
    e.preventDefault();
    setSessionTitle(e.currentTarget.value);
    setRenameTab(false);
    if (conversation.sessionId && e.currentTarget.value) {
        await changeSessionTitle(conversation.sessionId, e.currentTarget.value);
    }
  }

  return (
    <SidebarMenuButton
      asChild
      isActive={isActive}
      key={conversation.sessionId}
      className="cursor-pointer hover:bg-muted hover:text-foreground hover:last:opacity-100"
    >
      <div className="session-tab flex w-full justify-between">
        {renameTab ? (
          <>
            <input
              type="text"
              className="w-full overflow-hidden text-ellipsis text-nowrap px-1 py-1.5 text-[0.9rem] text-muted-foreground"
              defaultValue={sessionTitle ?? ""}
              autoFocus
              onBlur={handleRenameTab}
              onKeyDown={async (e) => {
                console.log(e.key)
                if (e.key == "Enter") {
                    await handleRenameTab(e);
                }
              }}
            />
          </>
        ) : (
          <>
            <Link
              key={conversation.sessionId}
              href={`/chat/${conversation.sessionId}`}
              onClick={handleClick}
              className="w-full overflow-hidden text-ellipsis text-nowrap rounded-md px-1 py-1.5 text-[0.9rem] text-muted-foreground"
            >
              <span>{sessionTitle}</span>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger
                className="flex h-4 w-6 items-center justify-center rounded-full opacity-0 transition-opacity hover:bg-gray-300 [.session-tab:hover_&]:opacity-100 text-muted-foreground"
              >
                <TabOptionsIcon />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={() => setRenameTab(true)}>
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setIsDeleteDialogOpen(true)}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <div className="flex justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    if (conversation.sessionId)
                      await deleteSession(conversation.sessionId);
                    setIsDeleteDialogOpen(false);
                    if (isActive) router.push("/chat");
                    router.refresh();
                  }}
                >
                  Delete
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarMenuButton>
  );
}

export function NewChatButton() {
  const { setOpenMobile } = useSidebar();
  const router = useRouter();
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setOpenMobile(false)
    router.push(`/chat`);
  };

  return (
    <div className="w-full">
      <Button variant="outline" className="w-full shadow-none" onClick={handleClick}>
        New Chat
      </Button>
    </div>
  );
}

export function NewSessionTab({sessions}: { sessions: { sessionId: string }[] }) {
  const { setOpenMobile } = useSidebar();
  const currentPath = usePathname();

  if (currentPath == "/chat") {
    return null;
  }

  const currentSessionId = currentPath.split("/")[2];

  if (sessions.find((s) => s.sessionId == currentSessionId)) {
    return null;
  }

  return (
    <SidebarMenuButton
      asChild
      isActive={true}
      className="cursor-pointer hover:bg-muted text-muted-foreground"
    >
      <div className="w-full overflow-hidden text-ellipsis text-nowrap rounded-md px-3 py-1.5 text-[0.9rem] text-muted-foreground" onClick={() => setOpenMobile(false)}>
        <span>
          {"new chat"}
        </span>
      </div>
    </SidebarMenuButton>
  );
}

interface Conversation {
  sessionId: string;
  userId: string;
  sessionTitle: string | null;
  createdAt: Date | string;
}

// Add a new function to delete multiple sessions
async function deleteMultipleSessions(sessionIds: string[], router: any, isActiveIncluded: boolean) {
  for (const id of sessionIds) {
    if (id) await deleteSession(id);
  }
  if (isActiveIncluded) router.push("/chat");
  router.refresh();
}

// Helper function to render a group of conversations
export function ConversationGroup({ 
  title, 
  conversations, 
  isFirst = false,
  fullConversations
}: { 
  title: string; 
  conversations: Conversation[]; 
  isFirst?: boolean;
  fullConversations?: Conversation[];
}) {
  const router = useRouter();
  const currentPath = usePathname();
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);
  
  if (conversations.length === 0) return null;
  
  const currentSessionId = currentPath.split("/")[2];
  const isActiveIncluded = conversations.some(conv => conv.sessionId === currentSessionId);
  
  return (
    <SidebarGroup className={`${isFirst ? 'mt-1' : 'mt-4'} flex max-w-[18rem] flex-col gap-[2px] px-4 md:max-w-[16rem]`}>
      <div className="flex justify-start items-center px-1 h-5 gap-1">
        <div className="text-xs font-semibold text-muted-foreground">{title}</div>
        {conversations.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger className="opacity-0 transition-opacity hover:opacity-100 h-4 w-4 flex items-center justify-center rounded-full hover:bg-gray-200 text-muted-foreground focus:outline-none data-[state=open]:opacity-100 data-[state=open]:bg-gray-200">
              <CaretDownIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setIsDeleteAllDialogOpen(true)}>
                Delete All
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      {isFirst && <NewSessionTab sessions={fullConversations ?? []} />}
      {conversations.map((conversation) => (
        <SidebarTab
          conversation={conversation}
          key={conversation.sessionId}
        />
      ))}
      
      <Dialog open={isDeleteAllDialogOpen} onOpenChange={setIsDeleteAllDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete all conversations in "{title}"?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete all conversations in this group.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setIsDeleteAllDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  const sessionIds = conversations.map(conv => conv.sessionId);
                  const button = document.activeElement as HTMLButtonElement;
                  if (button) {
                    button.disabled = true;
                    button.innerText = "Deleting...";
                  }
                  await deleteMultipleSessions(sessionIds, router, isActiveIncluded);
                  setIsDeleteAllDialogOpen(false);
                }}
              >
                Delete All
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarGroup>
  );
}

const TabOptionsIcon = () => (
  <DotsHorizontalIcon/>
);
