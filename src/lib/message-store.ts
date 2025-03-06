import { type Message } from "ai";
import { db } from "~/server/db";
import { messages } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function loadChat(sessionId: string): Promise<Message[]> {
  const db_messages = await db.query.messages.findMany({
    where: (message, { eq }) => eq(message.sessionId, sessionId),
    orderBy: (message, { asc }) => [asc(message.createdAt)],
  });

  return db_messages.map((message) => ({
    id: message.messageId,
    content: message.content ?? "",
    parts: message.contentReasoning
      ? [
          { type: "reasoning", reasoning: message.contentReasoning },
          { type: "text", text: message.content ?? "" },
        ]
      : [{ type: "text", text: message.content ?? "" }],
    role: message.role as "system" | "user" | "assistant" | "data",
    createdAt: message.createdAt,
    annotations: [{ model: message.model, sessionId: message.sessionId }],
  }));
}

export async function deleteAllMessageBySessionId(
  sessionId: string,
): Promise<void> {
  await db.delete(messages).where(eq(messages.sessionId, sessionId));
}

export async function saveMessage(message: {
  messageId: string | undefined;
  sessionId: string;
  content: string;
  contentReasoning: string | null | undefined;
  role: "system" | "user" | "assistant" | "data";
  model: string;
}): Promise<void> {
  // Check if the messageId already exists in the database
  const queryMessageId = message.messageId;
  if (queryMessageId) {
    const existingMessage = await db.query.messages.findFirst({
      where: (message) => eq(message.messageId, queryMessageId),
    });
    console.log(existingMessage);

    // If the messageId exists, skip insertion
    if (existingMessage) {
      console.log(`Message with ID ${message.messageId} already exists.`);
      return;
    }
  }

  // Insert the new message if it doesn't exist
  await db.insert(messages).values(message);
}

export async function saveMessages( messageList: {
  messageId: string | undefined;
  sessionId: string;
  content: string;
  contentReasoning: string | null | undefined;
  role: "system" | "user" | "assistant" | "data";
  model: string;
}[]): Promise<void> {
  if (!messageList || messageList.length === 0) return;

  console.log("db", messageList)
  await db.insert(messages).values(messageList);
}
