"use server"
import { db } from "~/server/db";
import { sessions } from "~/server/db/schema"
import { saveMessage } from "~/lib/message-store"
import { deleteSessionBySessionId, updateSessionTitle } from "~/lib/session-store"
import { auth } from "@clerk/nextjs/server";
import { type Model } from "~/lib/models";




export async function deleteSession(sessionId: string) {
    await deleteSessionBySessionId(sessionId)
}

export async function createNewSession(initialMessage: string, model: Model) {
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
        model: model
    }
    await saveMessage(message)
    return sessionId
    // redirect(`/chat/${sessionId}`)
}

export async function changeSessionTitle(sessionId: string, title: string) {
    await updateSessionTitle(sessionId, title)
}
