"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SidebarMenuButton, useSidebar } from "./ui/sidebar";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { deleteSession, changeSessionTitle } from "~/lib/actions";

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
      <div className="group flex w-full justify-between">
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
                className={`flex h-4 w-6 items-center justify-center rounded-full opacity-0 transition-opacity hover:bg-gray-300 group-hover:opacity-100`}
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

  return (
    <Link href="/chat" className="w-full" onClick={() => setOpenMobile(false)}>
      <Button variant="outline" className="w-full shadow-none">
        New Chat
      </Button>
    </Link>
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
      className="cursor-pointer hover:bg-muted hover:text-foreground hover:last:opacity-100"
    >
      <div className="w-full overflow-hidden text-ellipsis text-nowrap rounded-md px-3 py-1.5 text-[0.9rem] text-muted-foreground" onClick={() => setOpenMobile(false)}>
        <span>
          {"new chat"}
        </span>
      </div>
    </SidebarMenuButton>
  );
}

const TabOptionsIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 15 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM12.5 8.625C13.1213 8.625 13.625 8.12132 13.625 7.5C13.625 6.87868 13.1213 6.375 12.5 6.375C11.8787 6.375 11.375 6.87868 11.375 7.5C11.375 8.12132 11.8787 8.625 12.5 8.625Z"
      fill="currentColor"
      fillRule="evenodd"
      clipRule="evenodd"
    ></path>
  </svg>
);
