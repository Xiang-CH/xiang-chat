"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { SidebarMenuButton, useSidebar } from "./ui/sidebar"
import { Button } from "./ui/button"


export function SidebarTab({conversation}: {conversation: { sessionId: string | null, sessionTitle: string | null}}) {
    const currentPath = usePathname()
    const { setOpenMobile } = useSidebar();

    return (
        <SidebarMenuButton asChild isActive={currentPath == "/chat/"+conversation.sessionId} key={conversation.sessionId}>
            <Link
                key={conversation.sessionId}
                href={`/chat/${conversation.sessionId}`}
                onClick={() => setOpenMobile(false)}
                className="w-full rounded-md px-2 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground text-[0.9rem] overflow-hidden text-ellipsis text-nowrap"
            >
                <span>
                    {conversation.sessionTitle}
                </span>
            </Link>
        </SidebarMenuButton>
    )
}


export function NewChatButton() {
    const { setOpenMobile } = useSidebar();

    return (
        <Link href="/chat" className="w-full" onClick={() => setOpenMobile(false)}>
            <Button variant="outline" className="shadow-none w-full">
                New Chat
            </Button>
        </Link>
    )
}