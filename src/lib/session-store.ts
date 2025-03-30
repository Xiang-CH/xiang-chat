"use server";
import { db } from "~/server/db";
import { sessions } from "~/server/db/schema";
import { deleteAllMessageBySessionId, saveMessages } from "~/lib/message-store";
import { eq } from "drizzle-orm";

export async function loadSessionsByUserId(userId: string | null) {
  return userId
    ? db.query.sessions.findMany({
        where: (session, { eq }) => eq(session.userId, userId),
        orderBy: (session, { desc }) => [desc(session.createdAt)],
      })
    : [];
}

export async function deleteSessionBySessionId(sessionId: string) {
  try {
    await deleteAllMessageBySessionId(sessionId);
    await db.delete(sessions).where(eq(sessions.sessionId, sessionId));
  } catch (error) {
    console.error(error);
    throw new Error("Failed to delete session");
  }
}

export async function checkSessionBelongToUserId(
  sessionId: string,
  userId: string,
) {
  const sessions = await db.query.sessions.findMany({
    where: (session, { eq }) => eq(session.userId, userId),
  });
  return sessionId in sessions.map((session) => session.sessionId);
}

interface message {
  messageId: string;
  sessionId: string;
  content: string;
  contentReasoning: string | null | undefined;
  role: "system" | "user" | "assistant" | "data";
  model: string;
}

export async function createNewSession(
  userId: string,
  initialMessages: message[],
  sessionId?: string,
  sessionTitle?: string | null,
) {
  if (!sessionId) {
    sessionId = crypto.randomUUID();
  }
  await db.insert(sessions).values({
    sessionId: sessionId,
    userId: userId,
    sessionTitle: sessionTitle ?? "Untitled Session",
  });
  
  initialMessages.forEach((message) => {
    message.sessionId = sessionId;
  });
  await saveMessages(initialMessages);
}

export async function updateSessionTitle(sessionId: string, title: string) {
  await db
    .update(sessions)
    .set({ sessionTitle: title })
    .where(eq(sessions.sessionId, sessionId));
}
