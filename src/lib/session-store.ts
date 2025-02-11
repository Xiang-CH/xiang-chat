import { db } from "~/server/db";
import { sessions } from "~/server/db/schema"
import { saveMessage } from "~/lib/message-store"

export async function loadSessionsByUserId(userId: string | null) {
  return userId
    ? db.query.sessions.findMany({
        where: (session, { eq }) => eq(session.userId, userId),
        orderBy: (session, { desc }) => [desc(session.createdAt)],
      })
    : [];
}

export async function checkSessionBelongToUserId(sessionId: string, userId: string) {
  const sessions = await db.query.sessions.findMany({
    where: (session, { eq }) => eq(session.userId, userId),
  });
  return sessionId in sessions.map((session) => session.sessionId);
}

interface message { messageId: string, sessionId: string, content: string, contentReasoning: string | null | undefined, role: "system" | "user" | "assistant" | "data", model: string }

export async function createNewSession(userId: string, initialMessage: message) {
  const sessionId = crypto.randomUUID()
  await db.insert(sessions).values({
    sessionId: sessionId,
    userId: userId,
    sessionTitle: "New Chat"
  })
  initialMessage.sessionId = sessionId
  await saveMessage(initialMessage)
}