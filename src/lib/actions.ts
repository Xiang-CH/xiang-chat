"use server"
import { db } from "~/server/db";
import { sessions } from "~/server/db/schema"
import { saveMessage } from "~/lib/message-store"
import { auth } from "@clerk/nextjs/server";
import { redirect } from 'next/navigation'

// interface message { messageId: string | undefined, sessionId: string, content: string, contentReasoning: string | null | undefined, role: "system" | "user" | "assistant" | "data", model: string }

export async function createNewSession(initialMessage: string) {
    const { userId } = await auth();

    if (!userId) return

    const sessionId = crypto.randomUUID()
    await db.insert(sessions).values({
        sessionId: sessionId,
        userId: userId,
        sessionTitle: "New Chat"
    })
    
    const message = {
        messageId: undefined,
        sessionId: sessionId,
        content: initialMessage,
        contentReasoning: undefined,
        role: "user" as "system" | "user" | "assistant" | "data",
        model: "zhipu/glm-4-flash"
    }
    await saveMessage(message)
    
    redirect(`/chat/${sessionId}`)
}