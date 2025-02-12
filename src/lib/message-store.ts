import { type Message } from 'ai';
import { db } from "~/server/db";
import { messages } from '~/server/db/schema';

export async function loadChat(sessionId: string): Promise<Message[]> {
  const db_messages = await db.query.messages.findMany({
    where: (message, { eq }) => eq(message.sessionId, sessionId),
    orderBy: (message, { asc }) => [asc(message.createdAt)]
  });

  return db_messages.map((message) => ({
    id: message.messageId,
    content: message.content ?? "",
    parts: message.contenReasoning? [{type: "reasoning" ,reasoning: message.contenReasoning}, {type: "text", text: message.content ?? ""}] : [{type: "text", text: message.content ?? ""}],
    role: message.role as "system" | "user" | "assistant" | "data",
    createdAt: message.createdAt,
    annotation: [{model: message.model, sessionId: message.sessionId}]
  }));
}

export async function saveMessage( message: { messageId: string | undefined, sessionId: string, content: string, contentReasoning: string | null | undefined, role: "system" | "user" | "assistant" | "data", model: string }): Promise<void> {
    await db.insert(messages).values({
      messageId: message.messageId,
      sessionId: message.sessionId,
      content: message.content,
      contenReasoning: message.contentReasoning,
      role: message.role,
      model: message.model,
    })
}

// export async function saveMessages( messageList: { messageId: string, sessionId: string, content: string, contentReasoning: string | null | undefined, role: "system" | "user" | "assistant" | "data", model: string, createdAt: Date | undefined }[]): Promise<void> {
//   messageList.forEach(async (message) => {
//     await db.insert(messages).values({
//       messageId: message.messageId,
//       sessionId: message.sessionId,
//       content: message.content,
//       content_reasoning: message.contentReasoning,
//       role: message.role,
//       model: message.model,
//       // createdAt: message.createdAt ?? new Date()
//     })
//   })
// }

